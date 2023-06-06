import React, { useState, useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Setting from "./pages/Setting";
import Home from "./pages/Home";

const router = createBrowserRouter([
  {
    path: "/",

    children: [
      { index: true, element: <Home /> },
      { path: "/setting", element: <Setting /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
