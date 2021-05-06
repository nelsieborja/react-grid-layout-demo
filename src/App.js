import "./styles.css";
import "/node_modules/react-grid-layout/css/styles.css";
// import "/node_modules/react-resizable/css/styles.css";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useState } from "react";
import { nanoid } from "nanoid";
import { useLocalStorage } from "react-use";

const ResponsiveRGL = WidthProvider(Responsive);

let dragging = false;
let type;

const getDroppableProp = (t) => ({
  draggable: true,
  unselectable: "on",
  onDragStart() {
    type = t;
  }
  // onDragStop() {}
});
const Droppables = () => (
  <aside>
    <div {...getDroppableProp("GRID")}>GRID</div>
    <div {...getDroppableProp("CHART")}>CHART</div>
  </aside>
);
export default function App() {
  const [currBreakpoint, setCurrBreakpoint] = useState("lg");
  const [panels, setPanels] = useLocalStorage("panels", []);
  const [layouts, setLayouts] = useLocalStorage("layouts");
  // console.log(panels, layouts);

  const handleLayouts = (newLayouts) => {
    if (!dragging) setLayouts(newLayouts);
  };

  const handleDelete = ({ target: { id } }) => {
    setPanels(panels.filter((panel) => panel.i !== id));
    handleLayouts(
      Object.entries(layouts).reduce((acc, [key, value]) => {
        return {
          ...acc,
          [key]: value.filter((layout) => layout.i !== id)
        };
      }, {})
    );
  };

  const handleDrop = (layout, layoutItem, _event) => {
    dragging = false;

    if (layoutItem) {
      setPanels([
        ...panels,
        {
          ...layoutItem,
          type
        }
      ]);
      handleLayouts({ ...layouts, [currBreakpoint]: layout });
    }
  };

  return (
    <>
      <Droppables />

      <ResponsiveRGL
        // autoSize={false}
        compactType="horizontal"
        containerPadding={[0, 0]}
        draggableHandle=".draggable-handle"
        // isBounded
        margin={[4, 4]}
        // eliminate resizing animation on component mount
        measureBeforeMount={true}
        resizeHandles={["se", "e", "s"]}
        rowHeight={60}
        // LAYOUTS
        layouts={layouts}
        onLayoutChange={(_, newLayouts) => handleLayouts(newLayouts)}
        onBreakpointChange={(breakpoint) => setCurrBreakpoint(breakpoint)}
        // DROPS
        isDroppable={true}
        droppingItem={{ i: nanoid(), w: 3, h: 4, minW: 3, minH: 2 }}
        onDrop={handleDrop}
        // DRAGS
        onDragStart={() => (dragging = true)}
        onDragStop={() => (dragging = false)}
      >
        {panels.map(({ i, type, ...grid }) => {
          return (
            <div key={i} data-grid={grid}>
              <header>
                <h2>{type}</h2>
                <button className="draggable-handle">&#10021;</button>
                <button className="delete-button" id={i} onClick={handleDelete}>
                  &#x2715;
                </button>
              </header>
            </div>
          );
        })}
      </ResponsiveRGL>

      {panels.length < 1 && <em>DROP ITEMS HERE</em>}
    </>
  );
}
