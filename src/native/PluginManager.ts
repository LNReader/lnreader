import { NativeEventEmitter, NativeModules } from 'react-native';

interface PluginManagerInterface {
  createJsContext: (html: string) => Promise<JsContextId>;

  eval: (id: JsContextId, code: string) => Promise<string>;
}

export interface JsContext {
  eval: (code: string) => Promise<string>;
}

type JsContextId = string;

const { PluginManager: PluginManagerNative } = NativeModules as {
  PluginManager: PluginManagerInterface;
};

const contextToMsgCb = new Map();

export const PluginManager = {
  createJsContext: async (
    html: string,
    onMessage: (msg: string) => void,
  ): Promise<JsContext> => {
    let jsContextId = await PluginManagerNative.createJsContext(html);
    contextToMsgCb.set(jsContextId, onMessage);
    return {
      eval: async (code: string) => {
        return await PluginManagerNative.eval(jsContextId, code);
      },
    };
  },
};

const eventEmitter = new NativeEventEmitter(NativeModules.PluginManager);
eventEmitter.addListener('PluginManager', event => {
  contextToMsgCb.get(event.id)(event.message);
});
eventEmitter.addListener('NativeDebug', event => {
  if (__DEV__) {
    console.log(event);
  }
});
