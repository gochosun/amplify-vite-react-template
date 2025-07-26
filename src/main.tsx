import React from "react";
import ReactDOM from "react-dom/client";
/*import { Authenticator } from '@aws-amplify/ui-react';
*/
import AppWrapper from "./App.tsx"; // AppWrapper를 불러오도록 변경
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppWrapper /> {/* ✅ Authenticator 포함된 컴포넌트 */}
  </React.StrictMode>
);
