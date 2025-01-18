import { Router } from "express";
import { add, get } from "../data/user.js";
import {
  createJSONToken,
  isValidPassword,
  checkAuthMiddleware,
} from "../../util/auth.js";
import { validateSignupData } from "../../util/validation.js";
import { handleValidationErrors } from "../../util/errors.js";

const router = Router();

// Rejestracja użytkownika
router.post("/signup", async (req, res, next) => {
  console.log("Rejestracja użytkownika...");
  const data = req.body;

  try {
    console.log("Walidacja danych rejestracji...");
    const errors = await validateSignupData(data, req.app.locals.pool);
    if (Object.keys(errors).length > 0) {
      return handleValidationErrors(
        errors,
        res,
        "Rejestracja użytkownika nie powiodła się z powodu błędów walidacji."
      );
    }

    console.log("Dodawanie użytkownika...");
    const createdUser = await add(data, req.app.locals.pool);
    const authToken = createJSONToken(createdUser.username);
    // const authToken = createJSONToken({
    //   username: createdUser.username,
    //   id: createdUser.id,
    // });

    console.log("Użytkownik został dodany:", createdUser);
    res.status(201).json({
      message: "Użytkownik stworzony.",
      user: { id: createdUser.id, username: createdUser.username },
      token: authToken,
    });
  } catch (error) {
    console.error("Błąd rejestracji użytkownika:", error);
    next(error);
  }
});

// Logowanie użytkownika
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await get(username, req.app.locals.pool);
    if (!user || !(await isValidPassword(password, user.password))) {
      return res.status(422).json({
        message: "Autentyfikacja nie powiodła się.",
        errors: { credentials: "Błędna nazwa użytkownika lub hasło." },
      });
    }

    const token = createJSONToken(user.username);
    res.json({ message: "Logowanie powiodło się.", token });
  } catch (error) {
    console.error("Błąd podczas logowania:", error);
    res.status(500).json({ message: "Wystąpił błąd podczas logowania." });
  }
});

// Pobieranie danych użytkownika na podstawie tokenu
router.get("/user", checkAuthMiddleware, async (req, res) => {
  const username = req.token.username;

  console.log("Pobieranie danych użytkownika:", username);

  try {
    const user = await get(username, req.app.locals.pool);
    if (!user) {
      return res.status(404).json({ message: "Nie znaleziono użytkownika." });
    }

    delete user.password;
    res.json(user);
  } catch (error) {
    console.error("Błąd podczas pobierania danych użytkownika:", error);
    res.status(500).json({ message: "Wystąpił błąd." });
  }
});

// pobieranie uzytkownika na podstawie id
router.get("/user/:id/username", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await get(id, req.app.locals.pool, "id");
    if (!user) {
      return res.status(404).json({ message: "Nie znaleziono użytkownika." });
    }

    res.json({ username: user.username });
  } catch (error) {
    console.error("Błąd podczas pobierania danych użytkownika:", error);
    res.status(500).json({ message: "Wystąpił błąd." });
  }
});

export default router;
