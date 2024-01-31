import jwt from "jsonwebtoken";

const secretCode = "filmography";

export const maxAge = 1 * 24 * 60 * 60;

export function createToken(id) {
  return jwt.sign({ id }, secretCode, { expiresIn: maxAge });
}

export function verifyToken(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies.jwt;

    console.log(token);

    if (!token) {
      reject(new Error("Token is not found"));
      return;
    }

    jwt.verify(token, secretCode, (err, decodedToken) => {
      if (err) {
        reject(new Error("Token is not valid"));
      } else {
        resolve(decodedToken.id);
      }
    });
  });
}
