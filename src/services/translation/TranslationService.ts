import { showToast } from '@utils/showToast';

export interface TranslationResponse {
  content: string;
  model: string;
  instruction: string;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing?: {
    prompt: string;
    completion: string;
  };
}

export const fetchAvailableModels = async (): Promise<OpenRouterModel[]> => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'HTTP-Referer': 'https://lnreader.org',
        'X-Title': 'LNReader',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format from OpenRouter API');
    }

    // Extract relevant information and filter for text-to-text models
    return data.data
      .filter(
        (model: any) =>
          model.architecture?.modality === 'text->text' ||
          model.architecture?.modality === 'text+image->text',
      )
      .map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        description: model.description,
        pricing: model.pricing
          ? {
              prompt: model.pricing.prompt,
              completion: model.pricing.completion,
            }
          : undefined,
      }));
  } catch (error) {
    console.error('Error fetching models:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    showToast(`Error: ${errorMessage}`);
    return [];
  }
};

export const testConnection = async (
  apiKey: string,
  model: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!apiKey) {
      return {
        success: false,
        message: 'No API key provided. Please set an API key in settings.',
      };
    }

    if (!model) {
      return {
        success: false,
        message: 'No model selected. Please select a model in settings.',
      };
    }

    // First check if the API key is valid by making a models request with auth
    const modelsResponse = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://lnreader.org',
        'X-Title': 'LNReader',
      },
    });

    if (!modelsResponse.ok) {
      if (modelsResponse.status === 401) {
        return {
          success: false,
          message: 'Invalid API key. Please check your API key in settings.',
        };
      }
      throw new Error(`Failed to verify API key: ${modelsResponse.statusText}`);
    }

    // Make a small test completion to verify model access
    const testResponse = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://lnreader.org',
          'X-Title': 'LNReader',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant.',
            },
            {
              role: 'user',
              content: 'Send a very short response to test the connection.',
            },
          ],
          max_tokens: 10,
        }),
      },
    );

    // Check response
    if (!testResponse.ok) {
      const errorData = await testResponse.json().catch(() => ({
        error: { message: `HTTP error ${testResponse.status}` },
      }));

      // More detailed error handling
      if (testResponse.status === 403) {
        return {
          success: false,
          message:
            'Access denied: The selected model may not be available with your current API key or subscription plan.',
        };
      } else if (testResponse.status === 404) {
        return {
          success: false,
          message:
            'Model not found: The selected model ID is invalid or not available.',
        };
      } else if (errorData.error?.message?.includes('data policy')) {
        return {
          success: false,
          message:
            "No endpoints found matching your data policy. This model may have requirements your API key doesn't meet.",
        };
      }

      throw new Error(
        errorData.error?.message || `Test failed: ${testResponse.statusText}`,
      );
    }

    return {
      success: true,
      message:
        'Connection successful! Your API key and model are working correctly.',
    };
  } catch (error) {
    console.error('Test connection error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: errorMessage };
  }
};

export const translateText = async (
  apiKey: string,
  text: string,
  model = 'openai/gpt-3.5-turbo',
  instruction = '',
): Promise<TranslationResponse> => {
  // Validate inputs
  if (!apiKey) {
    throw new Error('API key is required');
  }

  if (!text || text.trim() === '') {
    throw new Error('Text to translate is required');
  }

  /**
   * We enhance the instruction to ensure the AI preserves formatting.
   * This is critical for maintaining text structure like paragraphs,
   * indentation, and line breaks in the translated content.
   *
   * The white-space: pre-wrap CSS and HTML processing of the response
   * (converting \n to <br/>) work together to maintain proper formatting
   * in the WebView display.
   */
  const formattingNote =
    'IMPORTANT: Preserve all original formatting including line breaks, paragraphs, whitespace, and indentation. The translated text should maintain the exact same structure as the original.';
  const enhancedInstruction = instruction
    ? `${instruction}\n\n${formattingNote}`
    : formattingNote;

  try {
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://github.com/LNReader/lnreader',
          'X-Title': 'LNReader',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: enhancedInstruction,
            },
            {
              role: 'user',
              content: text,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: { message: `HTTP error ${response.status}` } }));

      // Handle specific error cases
      if (response.status === 429) {
        if (errorData.error?.metadata?.provider_name) {
          throw new Error(
            `Rate limit exceeded for provider: ${errorData.error.metadata.provider_name}. Please try again later or select a different model.`,
          );
        } else {
          throw new Error(
            'Rate limit exceeded. Please try again later or select a different model.',
          );
        }
      } else if (response.status === 403) {
        throw new Error(
          'Access denied: You may not have permission to use this model with your API key.',
        );
      } else if (response.status === 404) {
        throw new Error(
          'Model not found: The selected model ID is invalid or not available.',
        );
      }

      // For other errors, throw a generic error with the message if available
      throw new Error(
        errorData.error?.message ||
          `Translation failed: ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Validate response format
    if (
      !data.choices ||
      !data.choices[0] ||
      !data.choices[0].message ||
      !data.choices[0].message.content
    ) {
      console.error('Unexpected response format:', JSON.stringify(data));
      throw new Error('Unexpected response format from translation service');
    }

    return {
      content: data.choices[0].message.content,
      model: data.model || model,
      instruction: enhancedInstruction,
    };
  } catch (error) {
    // Log the error for debugging
    console.error('Translation error:', error);

    // Re-throw the error to be handled by the caller
    throw error;
  }
};
