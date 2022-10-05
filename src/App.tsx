// [ReactのアニメーションにReact Poseが便利 - Qiita](https://qiita.com/seya/items/096862b488258f719e03)
import React from "react";
import { Graph } from "react-d3-graph";
import { GraphContext } from "./GraphContext";

// [css - React - Component Full Screen (with height 100%) - Stack Overflow](https://stackoverflow.com/questions/38428322/react-component-full-screen-with-height-100)
// [htmlで謎の余白・隙間ができる時、なくすために試してみるCSS l NatsukiMemo なつ記メモ of WEBデザインTIPS](https://natsukimemo.com/line-height-css)
const footerStyle = {
  position: "relative",
  width: "100%",
  height: "4%",
  color: "#fff",
  // [CSSのグラデーション（linear-gradient）の使い方を総まとめ！](https://saruwakakun.com/html-css/basic/linear-radial-gradient)
  background: "linear-gradient(to bottom right, #3498db, #7ac7fa)",
} as React.CSSProperties;

const leftFooter = {
  // [position: absoluteで中央に要素を寄せる最新の方法【css】(上下左右、上下、左右) | WEBクリエイターの部屋](https://arts-factory.net/position/#toc4)
  transform: "translateY(20%)",
  position: "absolute",
  left: "2%",
} as React.CSSProperties;

const rightFooter = {
  transform: "translateY(20%)",
  position: "absolute",
  right: "2%",
} as React.CSSProperties;

const graphStyle = {
  width: "100%",
  height: "96%",
  textAlign: "center",
} as React.CSSProperties;

const App: React.FC = () => {
  // [[@types/react] useRef return type clashes with ref prop type · Issue #35572 · DefinitelyTyped/DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped/issues/35572)
  const nodeId = React.useRef("") as React.MutableRefObject<string>;
  const [visibleBox, setVisibleBox] = React.useState(false);
  const [lang, setLang] = React.useState("en");
  const { graph, setGraph } = React.useContext(GraphContext);
  // [useEffectフックのしくみ - Qiita](https://qiita.com/ossan-engineer/items/740425a0df937a47e093)
  React.useEffect(() => {
    fetch("https://script.google.com/macros/s/AKfycbw4HYjyaavDE_38ICm-HkZ5_yp_EWNiqx9hO2t00sORHDeU8xmd/exec",
      { redirect: "follow" })
      .then(r => r.json())
      .then(r => setGraph(r))
      .catch(e => alert(e))
  }, []);
  // [CSSで中央寄せする9つの方法（縦・横にセンタリング）](https://saruwakakun.com/html-css/basic/centering#section3)
  const box = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    minWidth: "90%",
    color: "#fff",
    background: "linear-gradient(to bottom right, #e67e22, #fab475)",
    // [Reactでフェードイン/アウトのアニメーション | ハトらぼ](https://hatolabo.com/programming/react%E3%81%A7%E3%83%95%E3%82%A7%E3%83%BC%E3%83%89%E3%82%A4%E3%83%B3-%E3%82%A2%E3%82%A6%E3%83%88%E3%81%AE%E3%82%A2%E3%83%8B%E3%83%A1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3)
    transition: "1s",
    opacity: visibleBox ? 1.0 : 0,
    zIndex: visibleBox ? 1 : -1,
  } as React.CSSProperties;
  const myConfig = {
    // [How to set width/height config to 100% ? · Issue #23 · danielcaldas/react-d3-graph](https://github.com/danielcaldas/react-d3-graph/issues/23)
    height: window.innerHeight * 0.96,
    width: window.innerWidth,
    nodeHighlightBehavior: true,
    linkHighlightBehavior: true,
    highlightOpacity: 0.2,
    node: {
      size: 300,
      renderLabel: false,
    },
    link: {
      color: "#7AC7FA",
      highlightColor: "#3498DB",
    },
  };
  const onClickNode = (id: string) => {
    // [（Javascript）関数を値として持たせる（カッコ無し関数） - フロントサイドエンジニアという選択肢](http://jmqys.hatenablog.com/entry/2015/06/27/221012)
    if (graph.descriptions[lang][id]) {
      nodeId.current = id;
      setVisibleBox(true);
    }
  };
  const description = graph.descriptions[lang][nodeId.current];
  const image = graph.images[nodeId.current];
  const link = graph.href[nodeId.current];
  const changeLang = () => (lang === "en" ? setLang("jp") : setLang("en"));
  // [Reactで改行コード\nの入っているテキストを改行したまま表示する方法 - Qiita](https://qiita.com/ktnydi/items/c7027f9528df729a1e2f)
  // [【CSS】img画像の縦横比を保ったままボックス内に収める方法 | Freelance Journal フリーランス ジャーナル](https://1design.jp/web-development/css/1844)
  return (
    <>
      <div style={graphStyle}>
        <Graph
          id="graph-id"
          data={graph}
          config={myConfig}
          onClickNode={onClickNode}
        />
      </div>
      <div style={box} onClick={() => setVisibleBox(false)}>
        {image ? (
          <div style={{ paddingTop: "4%", textAlign: "center" }}>
            <img
              style={{ maxWidth: "50%", maxHeight: "50%" }}
              src={image}
              alt={description}
              decoding="async"
              loading="lazy"
            />
          </div>
        ) : null}
        <p style={{ paddingLeft: "4%", whiteSpace: "pre-wrap" }}>
          {description}
        </p>
        {link ? (
          <p style={{ paddingLeft: "4%" }}>
            <a href={link} target="_blank">
              link
            </a>
          </p>
        ) : null}
      </div>
      <footer style={footerStyle}>
        <div style={leftFooter}>© Tomostea</div>
        <div style={rightFooter} onClick={changeLang}>
          {lang}
        </div>
      </footer>
    </>
  );
};

export default App;
