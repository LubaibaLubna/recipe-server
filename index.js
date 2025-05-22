const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8holrnh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const recipesCollection = client.db('recipeDB').collection('recipes');

    // 🔍 GET: Fetch all recipes or filter by userEmail
    app.get('/recipes', async (req, res) => {
      const email = req.query.email;
      let query = {};

      if (email) {
        query.userEmail = email;
      }

      const result = await recipesCollection.find(query).toArray();
      res.send(result);
    });

    // 🔍 GET: Fetch a single recipe by ID
    app.get('/recipes/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await recipesCollection.findOne(query);
      res.send(result);
    });

    // ➕ POST: Add a new recipe
    app.post('/recipes', async (req, res) => {
      const newRecipe = req.body;

      if (!newRecipe.userEmail) {
        return res.status(400).send({ error: 'User email is required' });
      }

      try {
        const result = await recipesCollection.insertOne(newRecipe);
        res.send(result);
      } catch (error) {
        console.error('Failed to insert recipe:', error);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });

    // ✏️ PUT: Update a recipe by ID
    app.put('/recipes/:id', async (req, res) => {
      const { id } = req.params;
      const updatedData = req.body;

      // Convert preparationTime to number if it's a string
      if (updatedData.preparationTime) {
        updatedData.preparationTime = parseInt(updatedData.preparationTime);
      }

      try {
        const result = await recipesCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updatedData },
          { returnDocument: 'after' }
        );

        if (!result.value) {
          return res.status(404).json({ error: 'Recipe not found' });
        }

        res.json(result.value);
      } catch (error) {
        console.error('Failed to update recipe:', error);
        res.status(500).json({ error: 'Failed to update recipe' });
      }
    });

    
    // 🗑 DELETE: Delete a recipe by ID
    app.delete('/recipes/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await recipesCollection.deleteOne(query);
      res.send(result);
    });

    // ✅ Test connection
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Connected to MongoDB!');
  } finally {
    // Leave connection open
  }
}

run().catch(console.dir);

// Root route
app.get('/', (req, res) => {
  res.send('Server is getting hotter 🔥');
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
