import React from "react";
import { createBoard } from "@wixc3/react-board";

export default createBoard({
  name: "New Board",
  Board: () => (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <h1>Heading 1</h1>
      <div className="w-12 h-12 border-4 border-rose-800 border-dashed rounded-full animate-spin" />
    </div>
  ),
});
