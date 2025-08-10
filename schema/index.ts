import { gql } from 'graphql-tag';
import fs from 'fs';
import path from 'path';
import { userResolvers } from './resolvers/user.resolver';

// Load typeDefs from .graphql file
const userTypeDefs = gql(
  fs.readFileSync(path.join(__dirname, './typeDefs/user.graphql'), { encoding: 'utf8' })
);

export const typeDefs = [userTypeDefs];
export const resolvers = [userResolvers];
