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
  }
};

module.exports = Mutations;
