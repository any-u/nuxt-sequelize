<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: My Module
- Package name: my-module
- Description: My new Nuxt module
-->

# nuxt-sequelize

<!-- Badges Start -->
<p>
  <a href="https://npmjs.com/package/nuxt-sequelize">
    <img src="https://img.shields.io/npm/v/nuxt-sequelize.svg?style=flat-square&colorA=202128&colorB=36936A" alt="Version">
  </a>
  <a href="https://npmjs.com/package/nuxt-sequelize">
    <img src="https://img.shields.io/npm/dm/nuxt-sequelize.svg?style=flat-square&colorA=202128&colorB=36936A" alt="Downloads">
  </a>
  <a href="https://github.com/nuxt-sequelize/stargazers">
    <img src="https://img.shields.io/github/stars/any-u/nuxt-sequelize.svg?style=flat-square&colorA=202128&colorB=36936A" alt="Stars">
  </a>
</p>
<!-- Badges End -->

[Sequelize](https://sequelize.org/) module for [Nuxt](https://v3.nuxtjs.org)

## Quick Start

1. Add `nuxt-sequelize`, `sequelize`, and `inflection` dependencies to your project

   ```bash
   npm install nuxt-sequelize sequelize inflection
   ```

2. Add `nuxt-sequelize` to the `modules` section of `nuxt.config.ts`

   ```ts
   export default defineNuxtConfig({
     modules: ["nuxt-sequelize"],
   });
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

## Usage

### Configuration

1. Configure Nuxt Sequelize with the `sequelize` property.

   ```ts
   export default defineNuxtConfig({
     sequelize: {
       dir: "server/models",
       options: {},
     },
   });
   ```

   | Key     | Type        | Required | Description                                                                      |
   | ------- | ----------- | -------- | -------------------------------------------------------------------------------- |
   | dir     | string      | false    | Use the dir/ directory to automatically register models within your application. |
   | options | UserOptions | false    | Sequelize options                                                                |

2. Configure Sequelize secret via `.env`

   ```sh
   NUXT_SEQUELIZE_DIALECT='mysql'
   NUXT_SEQUELIZE_DATABASE=''
   NUXT_SEQUELIZE_HOST=""
   NUXT_SEQUELIZE_PORT=3306
   NUXT_SEQUELIZE_USERNAME="admin"
   NUXT_SEQUELIZE_PASSWORD="admin"
   ```

### Define Model

Files created under the model directory will be automatically registered under the sequelize object. The filename will be used as the model name.

   ```ts
   // models/user.ts
   import { DataTypes } from "sequelize";

   export default defineSequelizeModel({
     // ...ModelAttributes
   });
   ```

### Define Association

To define associations between models, create and configure the associations in the `associations.ts` file located in the `model` directory.

   ```ts
   // model/associations.ts

   export default defineSequelizeAssociation([
     // user - profile
     {
       type: "1to1",
       modelA: {
         name: "user",
         options: {
           foreignKey: "user_id",
           as: "profile",
         },
       },
       modelB: {
         name: "profile",
         options: {
           foreignKey: "user_id",
           as: "user",
         },
       },
     },
     // user -> article
     {
       type: "1toN",
       modelA: {
         name: "user",
         options: {
           foreignKey: "user_id",
           as: "articles",
         },
       },
       modelB: {
         name: "article",
         options: {
           foreignKey: "user_id",
           as: "user",
         },
       },
     },
     // article <-> tag
     {
       type: "NtoM",
       through: "articleTag",
       modelA: {
         name: "article",
         options: {
           foreignKey: "article_id",
           as: "tags",
         },
       },
       modelB: {
         name: "tag",
         options: {
           foreignKey: "tag_id",
           as: "articles",
         },
       },
     },
   ]);
   ```

### Use

Get the model collection through `useSequelize`, and then use its attributes directly

   ```ts
   // server/routes/hello.get.ts
   export default defineEventHandler(async () => {
     const sequelize = useSequelize();
     const result = await sequelize.user.findAll();
     return result;
   });
   ```

## Composables

### `defineSequelizeModel`

This function helps to create a new Sequelize model. Example usage:

#### Using `sequelize.define`:

   ```ts
   // models/user.ts
   import { DataTypes } from "sequelize";

   export default defineSequelizeModel({
     // ...ModelAttributes
   });
   ```

#### Extending `Model`

   ```ts
   // models/user.ts
   import { DataTypes, Model } from "sequelize";

   export default defineSequelizeModel((modelName, sequelize) => {
     class User extends Model {}
     User.init(
       {
         // ...ModelAttributes
       },
       {
         sequelize,
         modelName,
       }
     );

     return User;
   });
   ```

### `defineSequelizeAssociation`

Define associations between models

   ```ts
   // models/association.ts
   export default defineSequelizeAssociation([
     // ...Associations
   ])
   ```

### `useSequelize`

Access the model collection of sequelize

   ```ts
   export default defineEventHandler(async () => {
     const sequelize = useSequelize();
   });
   ```

### `useSequelizeClient`

Access the instance of sequelize

   ```ts
   export default defineEventHandler(async () => {
     const client = useSequelizeClient();
   });
   ```
