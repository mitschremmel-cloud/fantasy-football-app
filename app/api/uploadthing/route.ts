import { createRouteHandler } from "uploadthing/next";
// Ändere den Pfad von "../utils/uploadthing" zu "../../utils/uploadthing"
import { ourFileRouter } from "../../utils/uploadthing"; 

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
