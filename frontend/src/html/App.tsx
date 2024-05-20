import * as React from "react";
import { DialogueRoom, handleOnClickSendingMessage } from "../ts/frontend";
import Kot from "./kot.png";
import Logo from "./logo.png";
import BannerLeft from "./banner_left.png";
//<input type="button" value="Отправить" className="btn-danger" />

export default function MyApp() {
  const [message, setMessage] = React.useState("");

  const handleInput = (event: any) => {
    setMessage(event.target.value);
  };

  return (
    <>
      <div className="banner_left">
        <img src={BannerLeft} alt="banner_left" />
      </div>
      <div className="header_container">
        <img src={Logo} alt="Logo" />
        <div className="return_to_registration">
          <a href="login.html">
            <p>Выйти</p>
          </a>
        </div>
      </div>

      <div className="main">
        <div className="chat_form_container">
          <div className="chat_form_description">
            <h2>Чаты</h2>
            <h3>Сообщения</h3>
          </div>
          <form id="messForm">
            <div className="form_form">
              <label htmlFor="username" className="username">
                Никнейм
              </label>
              <div className="form_message">
                <DialogueRoom />
              </div>
            </div>
            <input
              type="txt" // Corrected from "txt" to "text"
              name="username"
              id="username"
            />
            <input
              name="message"
              id="message"
              className="form-control"
              placeholder="Введите сообщение"
              onChange={handleInput}
              value={message}
            ></input>
            <input
              type="button" // Changed from "button" to "submit" for form submission
              value="Отправить"
              className="btn-danger"
              onClick={() => {
                setMessage("");
                handleOnClickSendingMessage(message);
              }}
            />
          </form>
        </div>
      </div>
    </>
  );
}
