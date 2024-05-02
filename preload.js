const { contextBridge, ipcRenderer } = require("electron");
//const crypto = require("node:crypto");

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke("ping"),
});
// TODO: Fix this
// contextBridge.exposeInMainWorld("nodeCrypto", {
//   sha256sum(data) {
//     const hash = crypto.createHash("sha256");
//     hash.update(data);
//     return hash.digest("hex");
//   },
// });
