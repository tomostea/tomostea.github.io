// [React Context（useContext）入門 - the2g](https://the2g.com/post/introduction-usecontext)
import React from "react";
import App from "./App";

// [Object等の呼び出しでkeyに動的な変数を使う [TypeScript] - Qiita](https://qiita.com/tktcorporation/items/051bb03bb4d72930d8e9)
type graphObj = {
  nodes: { id: string; svg: string }[];
  links: { source: string; target: string }[];
  images: { [key: string]: string };
  descriptions: { [key: string]: { [key: string]: string } };
  href: { [key: string]: string };
};

const graphTemp: graphObj = {
  nodes: [{ id: "", svg: "" }],
  links: [{ source: "", target: "" }],
  images: { "": "" },
  descriptions: { en: { "": "" } },
  href: { "": "" },
};

// [useContext + useState 利用時のパフォーマンスはProviderの使い方で決まる！かも。。。？ - Qiita](https://qiita.com/jonakp/items/58c9c383473d02479ea7)
interface graphContext {
  graph: graphObj;
  setGraph: React.Dispatch<React.SetStateAction<graphObj>>;
}

export const GraphContext = React.createContext({} as graphContext);

// [ReactHooksでグローバルに値を管理する【TypeScript】 - Qiita](https://qiita.com/y4u0t2a1r0/items/36f0b3583051fe3c3b43)
const GraphContextProvider: React.FC = () => {
  const [graph, setGraph] = React.useState(graphTemp);
  return (
    <GraphContext.Provider value={{ graph, setGraph }}>
      <App />
    </GraphContext.Provider>
  );
};

export default GraphContextProvider;
