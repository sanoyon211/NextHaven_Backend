require("dotenv").config();
const mongoose = require("mongoose");
const Menu = require("./models/Menu");

const seedMenu = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding menu...");

    await Menu.deleteMany();
    console.log("Existing menu items cleared.");

    const menuData = [
      {
        name: "Truffle Beef Tartare",
        category: "Appetizers",
        price: "$32",
        description:
          "Finely chopped, highest-grade wagyu beef mixed with capers, shallots, and a touch of Dijon, topped with a quail egg and shaved black truffle.",
        ingredients:
          "Wagyu Beef, Capers, Quail Egg, Black Truffle, Dijon Mustard, Toasted Brioche",
        imageUrl:
          "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1500",
        isSignature: true,
      },
      {
        name: "Pan-Seared Scallops",
        category: "Appetizers",
        price: "$28",
        description:
          "Jumbo scallops seared to a golden crisp, served over a silky cauliflower purée and finished with crispy pancetta and crispy sage.",
        ingredients:
          "Jumbo Scallops, Cauliflower, Pancetta, Sage, Brown Butter",
        imageUrl:
          "https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=1500",
        isSignature: false,
      },
      {
        name: "Wagyu Ribeye Steak",
        category: "Main Courses",
        price: "$85",
        description:
          "A perfectly marbled 12oz Wagyu ribeye, cooked to your preference and served with potato gratin, wild mushrooms, and a rich bordelaise sauce.",
        ingredients:
          "Wagyu Ribeye, Potato Gratin, Wild Mushrooms, Red Wine Bordelaise",
        imageUrl:
          "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1500",
        isSignature: true,
      },
      {
        name: "Miso Glazed Black Cod",
        category: "Main Courses",
        price: "$54",
        description:
          "Sustainably caught black cod marinated in sweet saikyo miso, broiled to perfection, and served in a fragrant ginger dashi broth.",
        ingredients:
          "Black Cod, Saikyo Miso, Baby Bok Choy, Ginger, Dashi, Sesame",
        imageUrl:
          "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1500",
        isSignature: true,
      },
      {
        name: "Wild Mushroom Risotto",
        category: "Main Courses",
        price: "$42",
        description:
          "Creamy Arborio rice slowly cooked with a medley of wild foraged mushrooms, finished with aged parmesan and white truffle oil.",
        ingredients:
          "Arborio Rice, Porcini Mushrooms, Parmesan Reggiano, White Truffle Oil, Garlic",
        imageUrl:
          "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?q=80&w=1500",
        isSignature: false,
      },
      {
        name: "Valrhona Chocolate Soufflé",
        category: "Desserts",
        price: "$22",
        description:
          "A decadent, airy soufflé made with 70% dark Valrhona chocolate, served warm with Madagascar vanilla bean ice cream.",
        ingredients: "Dark Chocolate, Eggs, Sugar, Madagascar Vanilla, Cream",
        imageUrl:
          "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=1500",
        isSignature: true,
      },
      {
        name: "Lemon Tart",
        category: "Desserts",
        price: "$18",
        description:
          "A buttery shortbread crust filled with zesty lemon curd, topped with beautifully torched Italian meringue and a side of raspberry coulis.",
        ingredients: "Lemons, Sugar, Butter, Eggs, Flour, Raspberries",
        imageUrl:
          "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?q=80&w=1500",
        isSignature: false,
      },
      {
        name: "Artisan Cheese Board",
        category: "Appetizers",
        price: "$36",
        description:
          "A chef-selected assortment of fine international cheeses, served with honeycomb, fresh figs, candied walnuts, and house-made crackers.",
        ingredients:
          "Assorted Cheeses, Honeycomb, Figs, Walnuts, Artisanal Crackers",
        imageUrl:
          "https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=1500",
        isSignature: false,
      },
    ];

    await Menu.insertMany(menuData);
    console.log(`${menuData.length} menu items successfully seeded!`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding menu data:", error);
    process.exit(1);
  }
};

seedMenu();
