require("dotenv").config();

const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",

  entry: "./main.js",

  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },

  devServer: {
    static: path.join(__dirname, "dist"),
    compress: true,
    port: 9000,
    open: true,
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
    new webpack.DefinePlugin({
      "process.env.API_URL": JSON.stringify(process.env.API_URL),
      "process.env.APP_NAME": JSON.stringify(process.env.APP_NAME),
    }),
    new CopyPlugin({
      patterns: [
        { from: "service-worker.js", to: "" },
        { from: "manifest.json", to: "" },
        { from: "icon-192.png", to: "" }, // Τώρα θα το βρει 100%!
        { from: "icon-512.png", to: "" }, // Τώρα θα το βρει 100%!
        // { from: "lava_sound.mp3", to: "" },
        // { from: "bgmusic.mp3", to: "" },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(mp3|wav|ogg)$/i,
        type: "asset/resource",
        generator: {
          filename: "[name][ext]", // Κρατάει το αρχικό όνομα (π.χ. bgmusic.mp3) χύμα στο dist
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource", // Λέει στο Webpack 5 να αντιμετωπίζει τις εικόνες ως στατικά αρχεία
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
        options: {
          // Κλείνει εντελώς την αυτόματη επεξεργασία των links/εικόνων μέσα στο HTML.
          // Έτσι, ό,τι γράφεις στο index.html θα περάσει στο dist ΑΥΤΟΥΣΙΟ!
          sources: false,
        },
      },
    ],
  },
};
