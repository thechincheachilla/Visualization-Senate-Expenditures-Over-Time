// https://observablehq.com/@e55dec4cc10085c1/amount-spent-on-us-senate-election-campaigns@1864
import define1 from "./b2bbebd2f186ed03@1080.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["Map.png",new URL("./files/52d760fe3db482f0378475602098bcb37670f4fecde4b1d3e2b0d44f1c707f4ac0368505aa29cf741b742baed6fa7c1bccc1cc5f58c06f3fe50f4425f8f75b0a",import.meta.url)],["Stupid_Senate_Spendings - Mapped@17.csv",new URL("./files/7b0cdbce632ab74d4bf63e32569c11189a23c549bd763bd0f5e554059b338ec624fd505061f7af4888c18dc5d19781f4c4e2169e917fc43247b64b724ea262df",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer("title")).define("title", ["md"], function(md){return(
md`# Amount Spent on US Senate Election Campaigns`
)});
  main.variable(observer("desc1")).define("desc1", ["md"], function(md){return(
md`This is a map to explore how much the top two runoff candidates for each senate race across every state changes over time.`
)});
  main.variable(observer("desc2")).define("desc2", ["md"], function(md){return(
md`NOTE: Only election data from standard Class 1, 2, and 3 senate races is included. Special elections, 
(such as Georgia 2020 Warnock vs. Loeffler), are not included in this dataset.`
)});
  main.variable(observer("desc3")).define("desc3", ["md"], function(md){return(
md`Multi-Year selection: Use the selection range slide to display the average amount spent campaigning across the selected years. 
To isolate a specific party, use the party selector at the bottom right. To see the volume of wins and losses for the parties, use the victor selector at the bottom right (higher opacity means more wins for a party). Mouse over the party colored circles to 
see additional details regarding campaign expenditures.`
)});
  main.variable(observer("desc4")).define("desc4", ["md"], function(md){return(
md`Single-Year selection: When selecting a single year, the mouseover tooltip will reveal additional
details for a specific state's senate race. Click on a state's circle to open a wiki page regarding the corresponding senate race. The victor selector can be used to see who won in each state during a specific year.`
)});
  main.variable(observer("viewof electionCycles")).define("viewof electionCycles", ["rangeSlider","theme_NoUiSlider"], function(rangeSlider,theme_NoUiSlider){return(
rangeSlider({
  title: 'Election Cycle Year Selection',
  min: 2000,
  max: 2020,
  value: [2000, 2020],
  step: 2,
  theme: theme_NoUiSlider,
  color: 'hsl(195, 100%, 50%)',
  format: '.4', 
  separator: " to ",
})
)});
  main.variable(observer("electionCycles")).define("electionCycles", ["Generators", "viewof electionCycles"], (G, _) => G.input(_));
  main.variable(observer("dyn_title")).define("dyn_title", ["map_chart","electionCycles","md"], function(map_chart,electionCycles,md){return(
map_chart.setElectionYear(electionCycles),
md`Election Campaign Average Total Spendings by Party from ${electionCycles[0]} to ${electionCycles[1]}`
)});
  main.variable(observer("map_chart")).define("map_chart", ["SelectionModel","d3","width","height","US_map","margin","party_legend","winner_legend","years","init","senate_spendings","color","x_coor","y_coor","size"], function(SelectionModel,d3,width,height,US_map,margin,party_legend,winner_legend,years,init,senate_spendings,color,x_coor,y_coor,size)
{

  const sel_model = SelectionModel();
  
  const svg = d3.create('svg')
    .attr('width', width)
    .attr('height', height);

  svg.append('g')
    .append("svg:image")
      .attr("xlink:href", d => US_map)
      .attr("width", width);

  svg.append('g')
    .attr('transform', `translate(${width - margin.right - 100}, 500)`)
    .call(container => party_legend(container, sel_model))

  svg.append('g')
    .attr('transform', `translate(${width - margin.right - 100}, 500)`)
    .call(container => winner_legend(container, sel_model))

  const electionYear = svg.append('text')
    .attr('class', 'year')
    .attr('x', 700)
    .attr('y', 60)
    .attr('fill', '#ccc')
    .attr('font-family', 'Georgia')
    .attr('font-weight', 1000)
    .attr('font-size', 40)
    .text(years[0] + " to " + years[1]); 

  let tooltip = d3.select('body').append('div')
    .attr('class', 'svg-tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .text('Help Me');

  let c_united = svg.append('text')
    .attr('class', 'c_united')
    .attr('x', 400)
    .attr('y', 50)
    .attr('fill', '#808080')
    .attr('font-family', 'Georgia')
    .attr('font-weight', 500)
    .attr('font-size', 16)
    .style('visibility', 'hidden')
    .text('2010: Citizens United v. FEC');

  let spendings = svg
    .selectAll('circle.State')
    .data(init, d => d.State)
    .join('circle'); 

  function getAvgSpending(years) {
    let filtered_years = senate_spendings.filter(d => (parseInt(d.Year) >= years[0] && parseInt(d.Year) <= years[1]))
    return d3.rollup(filtered_years, v => d3.mean(v, d => d.Total_Spent), d => d.State, d=> d.Party);
  }
  
  function getAvgSpentYear(state, party, averages) {
    return averages.get(state).get(party);
  }
  
  function getTooltipText(data, years) {
    let text = ""
    if (years[0] === years[1]) {
      text = text.concat("State: " + data.State + "\n"); 
      text = text.concat("Member: " + data.Name + "\n"); 
      text = text.concat("Party: " + data.Party + "\n"); 
      text = text.concat("Amount Spent: $" + data.Total_Spent + "\n"); 
      if (parseInt(data.Winner_Flag) === 1) {
        text = text.concat("Won? Yes\n"); 
      } 
      else {
        text = text.concat("Won? No\n"); 
      }

    }
    else {
      text = text.concat("Years: " + years[0] + " to " + years[1] + "\n");
      text = text.concat("State: " + data.State + "\n");
      text = text.concat("Party: " + data.Party + "\n");
      text = text.concat("Average Spent: $" + parseInt(getAvgSpentYear(data.State, data.Party, getAvgSpending(years))) + "\n");
    
    }
    return text;
  }

  function getVisibility(party, winner) {
    let vis = 'visible'
    if (!sel_model.has(parties_index[parseInt(winner)])) {
      vis = 'hidden'; 
    }
    if (!sel_model.has(parties_index[party])) {
      vis = 'hidden'; 
    }
    return vis;
  }

  function setElectionYear(years) {
    let avg_spendings = getAvgSpending(years);
    spendings = spendings
      .data(senate_spendings.filter(d => (parseInt(d.Year) >= years[0] && parseInt(d.Year) <= years[1])), d => d.State)
      .join(
        enter => 
          enter
            .append('circle')
            .attr('class', 'name')
            .attr('id', 'circle')
            .attr('fill', d => color(d.Party))
            .attr('cx', d => x_coor(parseFloat(d.Longitude)))
            .attr('cy', d => y_coor(parseFloat(d.Latitude)))
            .attr('r', 0)
            .attr('opacity', 0),
        update => update,
        exit => 
          exit
            .transition()
            .duration('500')
            .attr('r', 0)
            .style('opacity', 0)
            .remove()
      );
      spendings
        .sort((a, b) => {
          let size_a = size(parseFloat(getAvgSpentYear(a.State, a.Party, avg_spendings)))
          let size_b = size(parseFloat(getAvgSpentYear(b.State, b.Party, avg_spendings)))
          if (size_a < size_b) {
            return 1;
          }
          if (size_a > size_b) {
            return -1;
          }
          return 0;
        }) 
        .transition()
        .duration(500)
        .attr('fill', d => color(d.Party))
        .attr('cx', d => x_coor(parseFloat(d.Longitude)))
        .attr('cy', d => y_coor(parseFloat(d.Latitude)))
        .attr('r', d => size(parseFloat(getAvgSpentYear(d.State, d.Party, avg_spendings))))
        .attr('opacity', 0.43)
        .attr('visibility', d => getVisibility(d.Party, d.Winner_Flag));
    
      spendings
        .on('click', function() {
          if (years[0] === years[1]) {
            window.open(
            d3.select(this).datum().Wiki_Link,
            '_blank' // Open a newpen in a new window.
            ).focus();
          }
        })
        .on('mouseover', function() {
          if (years[0] === years[1]) {
            d3.select(this).style("cursor", "pointer"); 
          }
          d3.select(this).attr('stroke', '#333').attr('stroke-width', 2);
          tooltip.text(getTooltipText(d3.select(this).datum(), years));
          return tooltip.style("visibility", "visible");
        })
        .on("mousemove", (event) => {
          tooltip.style("top", (event.pageY-40)+"px").style("left",(event.pageX+10)+"px");
        })
        .on('mouseout', function() {
          d3.select(this).attr('stroke', null);
          return tooltip.style("visibility", "hidden");
        });
      electionYear.text(years[0] !== years[1] ? years[0] + " to " + years[1] : years[0] + " election"); 
      if (years[0] === 2010 || years[1] === 2010) {
        c_united.style('visibility', 'visible');
      }
      else {
        c_united.style('visibility', 'hidden');
      }
  }

  let parties_index = {
    'D' : 0, 
    'I' : 1, 
    'R' : 2,
    0 : 3, 
    1 : 4
  }

  // sel_model.on('change.map_chart', () => {
  //   spendings.attr('visibility', d => {
  //     return sel_model.has(parties_index[d.Party]) ? 'visible' : 'hidden';
  //   });
  // });

  sel_model.on('change.map_chart', () => {
    spendings.attr('visibility', d => getVisibility(d.Party, d.Winner_Flag));
  });
  return Object.assign(svg.node(), {setElectionYear});
}
);
  main.variable(observer()).define(["FileAttachment"], function(FileAttachment){return(
FileAttachment("Stupid_Senate_Spendings - Mapped@17.csv").csv()
)});
  main.variable(observer("SelectionModel")).define("SelectionModel", ["d3"], function(d3){return(
function SelectionModel(values) {
  const dispatch = d3.dispatch('change');
  const state = new Set(values);
  
  const api = {
    on:     (type, fn) => (dispatch.on(type, fn), api),
    clear:  () => (clear(), api),
    has:    value => !state.size || state.has(value),
    set:    value => (update(value, true), api),
    toggle: value => (update(value, !state.has(value)), api)
  };
  
  function clear() {
    if (state.size) {
      state.clear();
      dispatch.call('change', api, api);
    }
  }
  
  function update(value, add) {
    console.log(state, value, add);
    if (add && !state.has(value)) {
      state.add(value);
      dispatch.call('change', api, api);
    } else if (!add && state.has(value)) {
      state.delete(value);
      dispatch.call('change', api, api);
    }
    // console.log(value, add, state)
  }

  return api;
}
)});
  main.variable(observer("party_legend")).define("party_legend", function(){return(
function party_legend(container, selmodel) {
  const entrySpacing = 16;
  const entryRadius = 5;
  const labelOffset = 4;
  const baselineOffset = 4;
  const entry_items = [
    { index: 0, label: 'Democrat', offset: 14 },
    { index: 1, label: 'Independent', offset: 14 }, 
    { index: 2, label: 'Republican', offset: 14 },
  ];
  
  const title_party = container.append('text')
    .attr('x', 0)
    .attr('y', 0)
    .attr('fill', 'black')
    .attr('font-family', 'Helvetica Neue, Arial')
    .attr('font-weight', 'bold')
    .attr('font-size', '12px')
    .text('Party Selection');
  
  // The "on" method registers event listeners
  // We update the selection model in response
  const entries = container.selectAll('g')
    .data(entry_items)
    .join('g')
      .attr('transform', d => `translate(0, ${d.index * entrySpacing + d.offset})`)
      .on('click', (e, d) => selmodel.toggle(d.index)) // <-- respond to clicks
      .on('dblclick', () => selmodel.clear());         // <-- respond to double clicks

  function colorSymbols(label) {
    if (label === "Democrat") {
        return '#0015BC';
    }
    if (label === "Republican") {
      return '#FF0000';
    }
    return '#228B22';
  }
  
  const symbols = entries.append('circle')
    .attr('cx', entryRadius)
    .attr('r', entryRadius)
    .attr('fill', d => colorSymbols(d.label));
  
  const labels = entries.append('text')
    .attr('x', 2 * entryRadius + labelOffset)
    .attr('y', baselineOffset)
    .attr('fill', 'black')
    .attr('font-family', 'Helvetica Neue, Arial')
    .attr('font-size', '11px')
    .style('user-select', 'none')
    .text(d => d.label);

  // Listen to selection model, update symbol and labels upon changes
  selmodel.on('change.party_legend', () => {
    symbols.attr('fill', d => selmodel.has(d.index) ? colorSymbols(d.label) : '#ccc');
    labels.attr('fill', d => selmodel.has(d.index) ? 'black' : '#bbb');
  });
}
)});
  main.variable(observer("winner_legend")).define("winner_legend", function(){return(
function winner_legend(container, selmodel) {
  const entrySpacing = 16;
  const entryRadius = 5;
  const labelOffset = 4;
  const baselineOffset = 4;
  const entry_items = [
    { index: 3, label: 'Loser', offset: 48 },
    { index: 4, label: 'Winner', offset: 48 }
  ];

  const title_winner = container.append('text')
    .attr('x', 0)
    .attr('y', 80)
    .attr('fill', 'black')
    .attr('font-family', 'Helvetica Neue, Arial')
    .attr('font-weight', 'bold')
    .attr('font-size', '12px')
    .text('Victor Selection');
  
  // The "on" method registers event listeners
  // We update the selection model in response
  const entries = container.selectAll('g')
    .data(entry_items)
    .join('g')
      .attr('transform', d => `translate(0, ${d.index * entrySpacing + d.offset})`)
      .on('click', (e, d) => selmodel.toggle(d.index)) // <-- respond to clicks
      .on('dblclick', () => selmodel.clear());         // <-- respond to double clicks

  function colorSymbols(label) {
    if (label === "Winner") {
      return '#87CEEB';
    }
    return '#808080';
  }
  
  const symbols = entries.append('circle')
    .attr('cx', entryRadius)
    .attr('r', entryRadius)
    .attr('fill', d => colorSymbols(d.label));
  
  const labels = entries.append('text')
    .attr('x', 2 * entryRadius + labelOffset)
    .attr('y', baselineOffset)
    .attr('fill', 'black')
    .attr('font-family', 'Helvetica Neue, Arial')
    .attr('font-size', '11px')
    .style('user-select', 'none')
    .text(d => d.label);

  // Listen to selection model, update symbol and labels upon changes
  selmodel.on('change.winner_legend', () => {
    symbols.attr('fill', d => selmodel.has(d.index) ? colorSymbols(d.label) : '#ccc');
    labels.attr('fill', d => selmodel.has(d.index) ? 'black' : '#bbb');
  });
}
)});
  main.variable(observer("theme_NoUiSlider")).define("theme_NoUiSlider", function(){return(
`
:scope {
  box-sizing: border-box;
  display: inline-block;
  width: 240px;
  color: #3b99fc;
  vertical-align: middle;
}

:scope .range-track {
  box-sizing: border-box;
  margin: 10px 17px;
  position: relative;
  background: #FAFAFA;
  border-radius: 4px;
  border: 1px solid #D3D3D3;
  box-shadow: inset 0 1px 1px #F0F0F0, 0 3px 6px -5px #BBB;
  height: 18px;
}
:scope .range-select {
  box-sizing: border-box;
  position: absolute;
  background: currentColor;
  left: var(--range-min);
  width: calc(var(--range-max) - var(--range-min));
  height: 100%;
  cursor: ew-resize;
}
:scope .thumb {
  box-sizing: border-box;
  position: absolute;
  width: 34px;
  height: 28px;
  top: -6px;
  border: 1px solid #D9D9D9;
  border-radius: 3px;
  background: #FFF;
  cursor: default;
  box-shadow: inset 0 0 1px #FFF, inset 0 1px 7px #EBEBEB, 0 3px 6px -3px #BBB;
}
:scope .thumb:before,
:scope .thumb:after {
  content: "";
  display: block;
  position: absolute;
  height: 14px;
  width: 1px;
  background: #E8E7E6;
  left: 14px;
  top: 6px;
}
:scope .thumb:after {
  left: 17px;
}
:scope .thumb-min {
  left: -17px;
}
:scope .thumb-max {
  right: -17px;
}
`
)});
  main.variable(observer("styles")).define("styles", ["html"], function(html){return(
html`
  <style>

  .svg-tooltip {
    font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple   Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    background: rgba(69,77,93,.9);
    border-radius: .1rem;
    color: #fff;
    display: block;
    font-size: 11px;
    max-width: 320px;
    padding: .2rem .4rem;
    position: absolute;
    text-overflow: ellipsis;
    white-space: pre;
    z-index: 300;
  }
</style>`
)});
  const child1 = runtime.module(define1);
  main.import("rangeSlider", child1);
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3@7')
)});
  main.variable(observer("US_map")).define("US_map", ["FileAttachment"], async function(FileAttachment){return(
await (await FileAttachment("Map.png")).url()
)});
  main.variable(observer("senate_spendings")).define("senate_spendings", ["FileAttachment"], function(FileAttachment){return(
FileAttachment("Stupid_Senate_Spendings - Mapped@17.csv").csv()
)});
  main.variable(observer("years")).define("years", ["d3","senate_spendings"], function(d3,senate_spendings){return(
d3.extent(senate_spendings, d => d.Year)
)});
  main.variable(observer()).define(["FileAttachment"], function(FileAttachment){return(
FileAttachment("Stupid_Senate_Spendings - Mapped@17.csv").csv()
)});
  main.variable(observer("init")).define("init", ["senate_spendings","years"], function(senate_spendings,years){return(
senate_spendings.filter(d => d.Year === years[0])
)});
  main.variable(observer("width")).define("width", function(){return(
1118
)});
  main.variable(observer("height")).define("height", function(){return(
700
)});
  main.variable(observer("x_coor")).define("x_coor", ["d3","width","margin"], function(d3,width,margin){return(
d3.scaleLinear()
  .domain([0, width])
  .range([margin.left, width - margin.right])
  .nice()
)});
  main.variable(observer("y_coor")).define("y_coor", ["d3","height","margin"], function(d3,height,margin){return(
d3.scaleLinear()
  .domain([height, 0])
  .range([height - margin.bottom, margin.top])
  .nice()
)});
  main.variable(observer("margin")).define("margin", function(){return(
{top:10, right:10, bottom:25, left:25}
)});
  main.variable(observer("size")).define("size", ["d3","senate_spendings"], function(d3,senate_spendings){return(
d3.scaleSqrt()
  .domain(d3.extent(senate_spendings, d => parseFloat(d.Total_Spent)))
  .range([2, 80])
)});
  main.variable(observer("color")).define("color", ["d3","senate_spendings"], function(d3,senate_spendings){return(
d3.scaleOrdinal()
  .domain(senate_spendings.map(d => d.Party))
  .range(['#0015BC','#FF0000','#228B22'])
)});
  return main;
}
