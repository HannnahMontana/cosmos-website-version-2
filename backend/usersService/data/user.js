import bcrypt from "bcryptjs";
const { hash } = bcrypt;

async function add(user, pool) {
  console.log("Dodawanie użytkownika...");
  try {
    const hashedPassword = await hash(user.password, 12);
    const result = await pool.query(
      "INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3) RETURNING id, username, is_admin",
      [user.username, hashedPassword, false]
    );
    console.log("Użytkownik został dodany:", result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error("Błąd dodawania użytkownika:", error);
    throw error;
  }
}

async function get(identifier, pool, field = "username") {
  console.log(`Pobieranie użytkownika: ${identifier}`);

  const allowedFields = ["id", "username"]; // Lista dozwolonych pól
  if (!allowedFields.includes(field)) {
    throw new Error(`Pole "${field}" nie jest dozwolone do wyszukiwania.`);
  }

  try {
    const query = `SELECT * FROM users WHERE ${field} = $1`;
    const result = await pool.query(query, [identifier]);

    console.log("Pobrano dane użytkownika: ", result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error("Błąd podczas pobierania użytkownika:", error);
    throw error;
  }
}

export { add, get };
