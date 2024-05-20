import * as React from "react";
import { DialogueRoom } from "../ts/frontend";

function leftBanner() {
  return (
    <>
      <div className="banner_left">
        <img src="banner_left.png" alt="banner_left" />
      </div>
      <div className="header_container">
        <img src="./logo.png" className="logo" />
        <div className="return_to_registration">
          <a href="login.html">
            <p>Войти в другой аккаунт</p>
          </a>
        </div>
      </div>
    </>
  );
}
//<input type="button" value="Отправить" className="btn-danger" />
export default function MyApp() {
  return (
    <>
      <div className="container">
        <div className="ActualPage">
          <div className="Dialogues">
            <h3>Диалоги</h3>

            <form id="messForm">
              <label htmlFor="username" className="username"></label>
              <input
                type="text"
                placeholder="Введите имя..."
                name="username"
                id="username"
                value=""
              />
            </form>
          </div>
          <div className="Messages">
            <label htmlFor="messageBox" className="username"></label>
            <div className="messageTextBox">
              <input
                type="text"
                placeholder="Введите Сообщение..."
                name="messageBox"
                id="messageBox"
                value=""
              />
              <input
                className="MessageButton"
                type="button"
                value="Send"
                onClick={() => console.log("Sent...")}
              ></input>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
