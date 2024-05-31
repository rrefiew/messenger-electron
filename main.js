//импорт модулей Electron (app,BrowserWindow и ipcMain)
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
//const crypto = require("node:crypto");
//const express = require("express");
//const socketIO = require("socket.i");

//const server = require("http").createServer(appExpress);
//const appExpress = express();
//const io = require("socket.io").listen(server);

//функция createWindow() загружает веб-страницу в новый экземпляр BrowserWindow
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.maximize();
  win.loadURL("http://localhost:3000");
  win.webContents.openDevTools();
  //win.loadFile("login.html");
};

//вызов функции, когда приложение готово к работе
app.whenReady().then(() => {
  createWindow();

  //открытие окна, если ни одно не открыто (для MacOS)
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      ipcMain.handle("ping", () => "pong");
      createWindow();
    }
  });
});

//выход из приложения, если все окна закрыты (для Windows и Linux)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
