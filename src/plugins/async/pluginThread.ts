import { fetchApi, fetchProto, fetchText } from '@plugins/helpers/fetch';
import { Plugin, PopularNovelsOptions } from '@plugins/types';
import { Filters } from '@plugins/types/filterTypes';
import { JsContext, PluginManager } from '@native/PluginManager';
import { defaultCover } from '@plugins/helpers/constants';
import {
  Storage,
  LocalStorage,
  SessionStorage,
} from '@plugins/helpers/storage';

interface PluginThread {
  initPlugin(pluginId: string, pluginCode: string): Promise<Plugin>;
}

export function getPluginThread(): PluginThread {
  return {
    async initPlugin(pluginId: string, pluginCode: string): Promise<Plugin> {
      await getPluginContext(); //make sure the plugin thread is ready
      if (__DEV__) {
        console.log('Init plugin', pluginId);
      }

      await loadPlugin(pluginId, pluginCode);

      let plg: Plugin = {
        id: await webviewCode(pluginId, 'return plugin.id;'),
        name: await webviewCode(pluginId, 'return plugin.name;'),
        lang: await webviewCode(pluginId, 'return plugin.lang;'),
        icon: await webviewCode(pluginId, 'return plugin.icon;'),
        site: await webviewCode(pluginId, 'return plugin.site;'),
        version: await webviewCode(pluginId, 'return plugin.version;'),
        filters: await webviewCode(pluginId, 'return plugin.filters;'),
        updateFilters: async () => {
          plg.filters = await webviewCode(pluginId, 'return plugin.filters;');
        },
        imgRequestInit: await webviewCode(
          pluginId,
          'return plugin.imgRequestInit;',
        ),
        pluginSettings: await webviewCode(
          pluginId,
          'return plugin.pluginSettings;',
        ),
        // @ts-ignore
        popularNovels: async (
          pageNo: number,
          options?: PopularNovelsOptions<Filters>,
        ) => {
          if (__DEV__) {
            console.log('Popular novels', pageNo, options);
          }
          return await webviewCodeAsync(
            pluginId,
            `return await plugin.popularNovels(${JSON.stringify(
              pageNo,
            )}, ${JSON.stringify(options)});`,
          );
        },
        // @ts-ignore
        parseNovel: async (novelPath: string) => {
          if (__DEV__) {
            console.log('Parse novel', novelPath);
          }
          return await webviewCodeAsync(
            pluginId,
            `return await plugin.parseNovel(${JSON.stringify(novelPath)});`,
          );
        },
        // @ts-ignore
        parsePage: (await webviewCode(pluginId, 'return !!plugin.parsePage;'))
          ? async (novelPath: string, page: string) => {
              if (__DEV__) {
                console.log('Parse page', novelPath, page);
              }
              return await webviewCodeAsync(
                pluginId,
                `return await plugin.parsePage(${JSON.stringify(
                  novelPath,
                )}, ${JSON.stringify(page)});`,
              );
            }
          : undefined,
        // @ts-ignore
        parseChapter: async (chapterPath: string) => {
          if (__DEV__) {
            console.log('Parse chapter', chapterPath);
          }
          return await webviewCodeAsync(
            pluginId,
            `return await plugin.parseChapter(${JSON.stringify(chapterPath)});`,
          );
        },
        // @ts-ignore
        searchNovels: async (searchTerm: string, pageNo: number) => {
          if (__DEV__) {
            console.log('Search novels', searchTerm, pageNo);
          }
          return await webviewCodeAsync(
            pluginId,
            `return await plugin.searchNovels(${JSON.stringify(
              searchTerm,
            )}, ${JSON.stringify(pageNo)});`,
          );
        },
        // @ts-ignore
        resolveUrl: (await webviewCode(pluginId, 'return !!plugin.resolveUrl;'))
          ? async (path: string, isNovel?: boolean) => {
              if (__DEV__) {
                console.log('Resolve url', path, isNovel);
              }
              return await webviewCodeAsync(
                pluginId,
                `return await plugin.resolveUrl(${JSON.stringify(
                  path,
                )}, ${JSON.stringify(isNovel)});`,
              );
            }
          : undefined,
        webStorageUtilized: await webviewCode(
          pluginId,
          'return plugin.webStorageUtilized;',
        ),
      };
      return plg;
    },
  };
}

let webviewCallbacks = new Map<
  number,
  (ret: any | null, err: string | null) => void
>();

async function webviewCode(pluginId: string, code: string) {
  let context = await getPluginContext();
  return JSON.parse(
    await context.eval(
      `(new Function("plugin", ${JSON.stringify(
        code,
      )}))(pluginsMap.get(${JSON.stringify(pluginId)}))`,
    ),
  );
}

let idI = 0;

async function webviewCodeAsync(pluginId: string, code: string) {
  let id = idI++;
  if (idI >= Number.MAX_SAFE_INTEGER) {
    idI = 0;
  }

  return new Promise(async (resolve, reject) => {
    webviewCallbacks.set(id, (ret: any, err: string | null) => {
      if (err !== null) {
        reject(new Error(err));
      } else {
        resolve(ret);
      }
    });

    let context = await getPluginContext();
    context.eval(`(new AsyncFunction("plugin", ${JSON.stringify(
      code,
    )}))(pluginsMap.get(${JSON.stringify(pluginId)})).then(ret=>{
			window.PluginManager.sendMessage(JSON.stringify({
				type: 'webview-code-res',
				id: ${id},
				data: ret
			}));
		}).catch(err=>{
          console.error(err.stack);
			window.PluginManager.sendMessage(JSON.stringify({
				type: 'webview-code-err',
				id: ${id},
				msg: err.message
			}));
		});`);
  });
}

async function loadPlugin(pluginId: string, pluginCode: string) {
  let storage = new Storage(pluginId);
  let localStorage = new LocalStorage(pluginId).get();
  let sessionStorage = new SessionStorage(pluginId).get();
  let storageBlob: any[] = [];
  storage.getAllKeys().forEach(key => {
    storageBlob.push([key, JSON.stringify(storage.get(key, true))]);
  });

  let context = await getPluginContext();
  await context.eval(`
    loadPlugin(${JSON.stringify(pluginId)}, ${JSON.stringify(
    pluginCode,
  )}, ${JSON.stringify(localStorage)}, ${JSON.stringify(
    sessionStorage,
  )}, ${JSON.stringify(storageBlob)});
  `);
}

let pluginContext: JsContext | null = null;
let pluginContextPromise: Promise<JsContext> | null = null;

async function getPluginContext(): Promise<JsContext> {
  if (pluginContext) {
    return pluginContext;
  }
  if (pluginContextPromise) {
    return await pluginContextPromise;
  }
  pluginContextPromise = makePluginContext();
  return await pluginContextPromise;
}

async function makePluginContext(): Promise<JsContext> {
  if (__DEV__) {
    console.log('Making plugin context');
  }
  let resData = new Map();

  let con = await PluginManager.createJsContext(
    // language=HTML
    `
		<!DOCTYPE html>
		<html>
		<script src="http://localhost:8081/assets/plugin_deps/bundle.js"></script>
		</html>
    `,
    (data: string) => {
      const event = JSON.parse(data, (key, val) => {
        if (
          val &&
          typeof val === 'object' &&
          val.__lnreader_special_type === 'FormData'
        ) {
          let ret = new FormData();
          for (let [key, value] of val.data) {
            ret.append(key, value);
          }
          return ret;
        }
        return val;
      });
      if (__DEV__) {
        if (event.type === 'webview-code-res') {
          console.log(
            '[Plugin Native Res] ' +
              JSON.stringify({ ...event, data: '[REDACTED FOR SPACE]' }),
          );
        } else if (event.type === 'fetchProto') {
          console.log(
            '[Plugin Native Res] ' +
              JSON.stringify({ ...event, data: '[REDACTED FOR SPACE]' }),
          );
        } else {
          console.log('[Plugin Native Req] ' + data);
        }
      }
      switch (event.type) {
        case 'webview-code-res':
          webviewCallbacks.get(event.id)?.(event.data, null);
          break;
        case 'webview-code-err':
          webviewCallbacks.get(event.id)?.(null, event.msg);
          break;
        case 'fetchApi':
          // @ts-ignore
          fetchApi(...event.data)
            .then(res => {
              let resId = idI++;
              if (idI >= Number.MAX_SAFE_INTEGER) {
                idI = 0;
              }
              resData.set(resId, res);
              setTimeout(() => {
                resData.delete(resId);
              }, 30000);

              let data = {
                ok: res.ok,
                status: res.status,
                url: res.url,
                resId: resId,
              };
              pluginContext!.eval(
                `nativeRes(${event.id}, ${JSON.stringify(data)});`,
              );
            })
            .catch(err => {
              pluginContext!.eval(
                `nativeResErr(${event.id}, ${JSON.stringify(err?.message)});`,
              );
            });
          break;
        case 'fetchApi-text':
          let d1 = resData.get(event.data);
          if (!d1) {
            pluginContext!.eval(
              `nativeResErr(${event.id}, ${JSON.stringify('Timed out')});`,
            );
            break;
          }
          resData.delete(event.data);
          d1.text()
            // @ts-ignore
            .then(res => {
              pluginContext!.eval(
                `nativeRes(${event.id}, ${JSON.stringify(res)});`,
              );
            })
            .catch((err: any) => {
              pluginContext!.eval(
                `nativeResErr(${event.id}, ${JSON.stringify(err?.message)});`,
              );
            });
          break;
        case 'fetchApi-json':
          let d2 = resData.get(event.data);
          if (!d2) {
            pluginContext!.eval(
              `nativeResErr(${event.id}, ${JSON.stringify('Timed out')});`,
            );
            break;
          }
          resData.delete(event.data);
          d2.json()
            // @ts-ignore
            .then(res => {
              pluginContext!.eval(
                `nativeRes(${event.id}, ${JSON.stringify(res)});`,
              );
            })
            .catch((err: any) => {
              pluginContext!.eval(
                `nativeResErr(${event.id}, ${JSON.stringify(err?.message)});`,
              );
            });
          break;
        case 'fetchText':
          // @ts-ignore
          fetchText(...event.data)
            .then(res => {
              pluginContext!.eval(
                `nativeRes(${event.id}, ${JSON.stringify(res)});`,
              );
            })
            .catch(err => {
              pluginContext!.eval(
                `nativeResErr(${event.id}, ${JSON.stringify(err?.message)});`,
              );
            });
          break;
        case 'fetchProto':
          // @ts-ignore
          fetchProto(...event.data)
            .then(res => {
              pluginContext!.eval(
                `nativeRes(${event.id}, ${JSON.stringify(res)});`,
              );
            })
            .catch(err => {
              pluginContext!.eval(
                `nativeResErr(${event.id}, ${JSON.stringify(err?.message)});`,
              );
            });
          break;
        case 'storage-set':
          const storage1 = new Storage(event.data.pluginId);
          storage1.set(event.data.key, event.data.data);
          break;
        case 'storage-delete':
          const storage2 = new Storage(event.data.pluginId);
          storage2.delete(event.data.key);
          break;
      }
    },
  );
  // language=JavaScript
  await con.eval(`
		const AsyncFunction = Object.getPrototypeOf(async function () {
		}).constructor;

		let pluginsMap = new Map();

		function loadPlugin(pluginId, pluginCode, localStorage, sessionStorage, storageData) {
			let plugin = initPlugin(pluginId, pluginCode, localStorage, sessionStorage, storageData);
			pluginsMap.set(pluginId, plugin);
		}

		//NOTE: this is duplicated in filterTypes.ts
		const FilterTypes = {
			TextInput: 'Text',
			Picker: 'Picker',
			CheckboxGroup: 'Checkbox',
			Switch: 'Switch',
			ExcludableCheckboxGroup: 'XCheckbox',
			Text: 'TextInput',
			Checkbox: 'CheckboxGroup',
			XCheckbox: 'ExcludableCheckboxGroup',
		}
		//NOTE: this is duplicated in plugin/types/index.ts
		const NovelStatus = {
			Unknown: 'Unknown',
			Ongoing: 'Ongoing',
			Completed: 'Completed',
			Licensed: 'Licensed',
			PublishingFinished: 'Publishing Finished',
			Cancelled: 'Cancelled',
			OnHiatus: 'On Hiatus',
			"Publishing Finished": 'PublishingFinished',
			"On Hiatus": 'OnHiatus',
		}

		const {encode, decode} = require('urlencode');

		const packages = {
			'htmlparser2': {Parser: require("htmlparser2").Parser},
			'cheerio': {load: require("cheerio").load},
			'dayjs': require("dayjs"),
			'urlencode': {encode, decode},
			'@libs/novelStatus': {NovelStatus},
			'@libs/fetch': {
				fetchApi: async function (...params) {
					let nativeFetchData = await native('fetchApi', params);
					return {
						ok: nativeFetchData.ok,
						status: nativeFetchData.status,
						url: nativeFetchData.url,
						text: async function () {
							return await native('fetchApi-text', nativeFetchData.resId);
						},
						json: async function () {
							return await native('fetchApi-json', nativeFetchData.resId);
						}
					}
				},
				fetchText: async function (...params) {
					return await native('fetchText', params);
				},
				fetchProto: async function (...params) {
					return await native('fetchProto', params);
				}
			},
			'@libs/isAbsoluteUrl': {isUrlAbsolute},
			'@libs/filterInputs': {FilterTypes},
			'@libs/defaultCover': {
				defaultCover: ${JSON.stringify(defaultCover)}
			}
		};

		//some plugins use built in fetch :skull: that wont work in webview cus of CORS
		window.fetch = packages['@libs/fetch'].fetchApi;

		let nativeCallbacks = new Map();

		let idI = 0;

		async function native(type, data) {
			let id = idI++;
			if (idI >= Number.MAX_SAFE_INTEGER) {
				idI = 0;
			}

			return new Promise((resolve, reject) => {
				nativeCallbacks.set(id, (ret, err) => {
					if (err !== null) reject(new Error(err))
					else resolve(ret);
				});

				window.PluginManager.sendMessage(JSON.stringify({
					type,
					id,
					data
				}, (k, v) => {
					if (v instanceof FormData) {
						return {
							__lnreader_special_type: "FormData",
							data: [...v.entries()],
						}
					}
					return v;
				}));
			});
		}

		function nativeRes(id, res) {
			nativeCallbacks.get(id)(res, null);
		}

		function nativeResErr(id, res) {
			nativeCallbacks.get(id)(null, res);
		}

		function initPlugin(pluginId, pluginCode, localStorage, sessionStorage, storageData) {
			const _require = (packageName) => {
				if (packageName === '@libs/storage') {
					return {
						storage: new Storage(pluginId, storageData),
						localStorage: {
							get: () => localStorage
						},
						sessionStorage: {
							get: () => sessionStorage
						}
					};
				}
				if (!(packageName in packages)) {
					console.error(pluginId + " is importing unknown package: " + packageName)
				}
				return packages[packageName];
			};

			return Function(
				'require',
				'module',
				'const exports = module.exports = {};\\n' + pluginCode + '\\nreturn exports.default',
			)(_require, {});
		}

		function isUrlAbsolute(url) {
			if (url) {
				if (url.indexOf('//') === 0) {
					return true;
				} // URL is protocol-relative (= absolute)
				if (url.indexOf('://') === -1) {
					return false;
				} // URL has no protocol (= relative)
				if (url.indexOf('.') === -1) {
					return false;
				} // URL does not contain a dot, i.e. no TLD (= relative, possibly REST)
				if (url.indexOf('/') === -1) {
					return false;
				} // URL does not contain a single slash (= relative)
				if (url.indexOf(':') > url.indexOf('/')) {
					return false;
				} // The first colon comes after the first slash (= relative)
				if (url.indexOf('://') < url.indexOf('.')) {
					return true;
				} // Protocol is defined before first dot (= absolute)
			}
			return false; // Anything else must be relative
		}

		class Storage {
			#pluginID;
			#data = new Map();

			constructor(pluginID, data) {
				this.#pluginID = pluginID;
				for (const [key, value] of data) {
					this.#data.set(key, value);
				}
			}

			/**
			 * Sets a key-value pair in storage.
			 *
			 * @param {string} key - The key to set.
			 * @param {any} value - The value to set.
			 * @param {Date | number} [expires] - Optional expiry date or time in milliseconds.
			 */
			set(key, value, expires) {
				const item = {
					created: new Date(),
					value,
					expires: expires instanceof Date ? expires.getTime() : expires
				};
				this.#data.set(key, JSON.stringify(item));
				native("storage-set", {pluginId: this.#pluginID, key, data: JSON.stringify(item)});
			}

			/**
			 * Retrieves the value for a given key from storage.
			 *
			 * @param {string} key - The key to retrieve the value for.
			 * @param {boolean} [raw] - Optional flag to return the raw stored item.
			 * @returns {any} The stored value or undefined if key is not found.
			 */
			get(key, raw) {
				const storedItem = this.#data.get(key);
				if (storedItem) {
					const item = JSON.parse(storedItem);
					if (item.expires) {
						if (Date.now() > item.expires) {
							this.delete(key);
							return undefined;
						}
						if (raw) {
							item.expires = new Date(item.expires).getTime();
						}
					}
					return raw ? item : item.value;
				}
				return undefined;
			}

			/**
			 * Deletes a key from storage.
			 *
			 * @param {string} key - The key to delete.
			 */
			delete(key) {
				this.#data.delete(key);
				native("storage-delete", {pluginId: this.#pluginID, key});
			}

			/**
			 * Clears all stored items from storage.
			 */
			clearAll() {
				const keysToRemove = this.getAllKeys();
				keysToRemove.forEach(key => this.delete(key));
			}

			/**
			 * Retrieves all keys set by the \`set\` method.
			 *
			 * @returns {string[]} An array of keys.
			 */
			getAllKeys() {
				return this.#data.keys();
			}
		}
    `);
  pluginContext = con;
  if (__DEV__) {
    console.log('Plugin context made!');
  }
  return pluginContext;
}
