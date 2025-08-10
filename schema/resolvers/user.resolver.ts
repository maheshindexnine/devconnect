import User from "../../models/User";

export const userResolvers = {
  User: {
    fullName: (parent: any) => {
      return `${parent.firstName} ${parent.lastName}`;
    },
  },
  Query: {
    users: async (
      _: any,
      {
        filter,
        search,
        sortField = "createdAt",
        sortOrder = "desc",
        page = 1,
        limit = 10,
      }: any,
      context: any
    ) => {
      // Check if user exists in context (set by authMiddleware)
      if (!context.user) {
        throw new Error("Authentication required");
      }

      const { role, id } = context.user;

      const query: any = {};

      if (role !== "Admin") {
        // If not admin, return only this user's record
        query._id = id;
      } else {
        // Filtering
        if (filter?.gender) query.gender = filter.gender;
        if (filter?.role) query.role = filter.role;
        if (filter?.minAge || filter?.maxAge) {
          query.age = {};
          if (filter.minAge) query.age.$gte = filter.minAge;
          if (filter.maxAge) query.age.$lte = filter.maxAge;
        }

        // Search by full name (firstName + lastName)
        if (search) {
          query.$or = [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ["$firstName", " ", "$lastName"] },
                  regex: search,
                  options: "i",
                },
              },
            },
          ];
        }
      }

      // Sorting
      const sort: any = {};
      sort[sortField] = sortOrder === "asc" ? 1 : -1;

      // Pagination
      const skip = (page - 1) * limit;

      const [users, totalCount] = await Promise.all([
        User.find(query).sort(sort).skip(skip).limit(limit),
        User.countDocuments(query),
      ]);

      return { users, totalCount };
    },
    user: async (_: any, { id }: { id: string }) => {
      return await User.findById(id);
    },
  },
  Mutation: {
    createUser: async (_: any, { input }: any) => {
      const user = new User(input);
      return await user.save();
    },
    updateUser: async (_: any, { id, input }: any) => {
      return await User.findByIdAndUpdate(id, input, { new: true });
    },
    deleteUser: async (_: any, { id }: { id: string }) => {
      const deleted = await User.findByIdAndDelete(id);
      return !!deleted;
    },
  },
};
