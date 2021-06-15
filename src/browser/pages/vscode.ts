import { getOptions } from "../../common/util"

const options = getOptions()

// TODO: Add proper types.
/* eslint-disable @typescript-eslint/no-explicit-any */

let nlsConfig: any
try {
  nlsConfig = JSON.parse(document.getElementById("vscode-remote-nls-configuration")!.getAttribute("data-settings")!)
  if (nlsConfig._resolvedLanguagePackCoreLocation) {
    const bundles = Object.create(null)
    nlsConfig.loadBundle = (bundle: any, _language: any, cb: any): void => {
      const result = bundles[bundle]
      if (result) {
        return cb(undefined, result)
      }
      // FIXME: Only works if path separators are /.
      const path = nlsConfig._resolvedLanguagePackCoreLocation + "/" + bundle.replace(/\//g, "!") + ".nls.json"
      fetch(`${options.base}/vscode/resource/?path=${encodeURIComponent(path)}`)
        .then((response) => response.json())
        .then((json) => {
          bundles[bundle] = json
          cb(undefined, json)
        })
        .catch(cb)
    }
  }
} catch (error) {
  /* Probably fine. */
}

try {
  document.body.style.background = JSON.parse(localStorage.getItem("colorThemeData")!).colorMap["editor.background"]
} catch (error) {
  // Oh well.
}
