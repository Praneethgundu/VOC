const { createUser } = require("./src/services/userService");

const seed = async () => {
  try {
    console.log("Seeding users...");
    
    // Attempt to create users, ignoring errors if they already exist
    try {
      await createUser("U001", "admin", "admin123", "ADMIN");
      console.log("Created admin user");
    } catch (e) { console.log(e.message); }

    try {
      await createUser("U002", "reception", "reception123", "RECEPTIONIST");
      console.log("Created receptionist user");
    } catch (e) { console.log(e.message); }

    try {
      await createUser("U003", "doctor", "doctor123", "DOCTOR");
      console.log("Created doctor user");
    } catch (e) { console.log(e.message); }

    try {
      await createUser("U004", "pharma", "pharma123", "PHARMACIST");
      console.log("Created pharmacist user");
    } catch (e) { console.log(e.message); }

    console.log("Seeding complete.");
  } catch (error) {
    console.error("Error seeding users:", error);
  }
};

seed();
