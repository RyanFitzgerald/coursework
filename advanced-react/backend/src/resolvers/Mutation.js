const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: check if logged in
    
    const item = await ctx.db.mutation.createItem({
      data: {
        ...args
      }
    }, info);

    return item;
  },
  updateItem(parent, args, ctx, info) {
    // First take copy of updates data
    const updates = {...args};

    // Remove the ID from the updates data
    delete updates.id;

    // Run the update method
    return ctx.db.mutation.updateItem({
      data: updates,
      where: {
        id: args.id
      }
    }, info)
  },
  async deleteItem(parent, args, ctx, info) {
    const where = {id: args.id};

    // Find item
    const item = await ctx.db.query.item({where}, `{id, title}`);

    // Check if they own item / have permissions

    // Delete it (`info` comes from frontend)
    return ctx.db.mutation.deleteItem({where}, info);
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    
    // Hash the password
    const password = await bcrypt.hash(args.password, 10);

    // Create the user in db
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password, // overwrite password with hash
        permissions: { set: ['USER'] },
      }
    }, info);

    // Create JWT token for them
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // Set JWT as cookie on response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });

    // Return user to the browser
    return user;
  }
};

module.exports = Mutations;
