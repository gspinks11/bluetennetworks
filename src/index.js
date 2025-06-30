"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
// src/index.tsx (for Create React App)
var react_1 = __importDefault(require("react"));
var client_1 = __importDefault(require("react-dom/client"));
require("./index.css"); // Your global CSS
var App_1 = __importDefault(require("./App")); // Your main App component
// --- Standard Amplify Configuration for Gen 1 (v5.x.x) ---
var aws_amplify_1 = require("aws-amplify");
var aws_exports_1 = __importDefault(require("./aws-exports"));
aws_amplify_1.Amplify.configure(aws_exports_1.default);
// --- End Standard Amplify Configuration ---
var root = client_1.default.createRoot(document.getElementById('root'));
root.render((0, jsx_runtime_1.jsx)(react_1.default.StrictMode, { children: (0, jsx_runtime_1.jsx)(App_1.default, {}) }));
