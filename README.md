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
    <img src="https://img.shields.io/github/stars/any-u/nuxt-sequelize.svg?style=flat-square&colorA=202128&colorB=36936A" alt="Downloads">
  </a>
</p>
<!-- Badges End -->

[Sequelize](https://sequelize.org/) module for [Nuxt](https://v3.nuxtjs.org)

## Quick Start

1. Add `nuxt-sequelize` dependency to your project

   ```bash
   npm install nuxt-sequelize
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

| Key     | Type        | Require | Description                                                                      |
| ------- | ----------- | ------- | -------------------------------------------------------------------------------- |
| dir     | string      | false   | Use the dir/ directory to automatically register models within your application. |
| options | UserOptions | false   | Sequelize options                                                                |

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

> The model file must be a js file. Because Nuxt currently does not support dynamic import.

```ts
// models/user.js
import { DataTypes } from "sequelize";

export default defineSequelizeModel({
  // ...ModelAttributes
});
```

### Use
Get the model collection through `useSequelize`, and then use its attributes directly
```ts
// server/routes/hello.get.ts
export default defineEventHandler(async () => {
  const sequelize = useSequelize()
  const result = await sequelize.user.findAll()
  return result
})

```


## Composables

### `defineSequelizeModel`

This function help to create a new Sequelize model. Example usage

#### Using `sequelize.define`:

```ts
// models/user.js
import { DataTypes } from "sequelize";

export default defineSequelizeModel({
  // ...ModelAttributes
});
```

#### Extending `Model`

```ts
// models/user.js
import { DataTypes, Model } from "sequelize";

export default defineSequelizeModel((modelName, sequelize) => {
  class User extends Model {}
  User.init(
    {
      // ...ModelAttributes
    },
    {
      sequelize,
      modelName
    }
  );

  return User
});
```

### `useSequelize`
Access the model collection of sequelize

```ts
export default defineEventHandler(async () => {
  const sequelize = useSequelize()
})
```

### `useSequelizeClient`
Access the instance of sequelize
```ts
export default defineEventHandler(async () => {
  const client = useSequelizeClient()
})
```