import io from "socket.io-client";
//Hardcoded:

const SiteLocation = "https://quagunesop.beget.app";

export const socket = io(SiteLocation);
