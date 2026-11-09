export function mount(containerId, props = {}) {
  const container = document.getElementById(containerId);
  const root = ReactDOM.createRoot(container);

  function LiveClock(props) {
    const [time, setTime] = React.useState(new Date().toUTCString());
    const [color, setColor] = React.useState(props.color || "black");

    React.useEffect(() => {
      const timer = setInterval(() => {
        const newTime = new Date().toUTCString();
        setTime(newTime);

        // ✅ Send to Royale
        EventBridge.dispatchReactToRoyale("react-to-royale", {
          message: "Time updated",
          time: newTime
        });
      }, 1000);

      return () => clearInterval(timer);
    }, []);

    React.useEffect(() => {
      const handler = (e) => {
        if (e.detail.color) setColor(e.detail.color);
      };

      // ✅ Listen from Royale
      EventBridge.listenRoyaleToReact("royale-to-react", handler);
      return () => EventBridge.removeRoyaleToReact("royale-to-react", handler);
    }, []);

    //return React.createElement("div", { style: { color, fontSize: "20px" } }, time);
   return React.createElement(React.Fragment, null,
    React.createElement("h3", null, "Live Clock (React)"),
    React.createElement("p", null, "Hello Apache Royale, send me color code to change the color of clock :: " + color),
    React.createElement("div", { style: { color , fontSize: "20px",  fontWeight:"bold" } }, time)
    );

  }

  root.render(React.createElement(LiveClock, props));
}
