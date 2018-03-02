$(document).ready(() => {
  var mazeGrid = new Array()
  var startPointSet = false;
  var endPointSet = false;
  var startPoint = {}

  $.fn.gridData = function(columnCount, rowCount) {
    var data = new Array();
    var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
    var ypos = 1;
    var width = 15;
    var height = 15;
    var click = 0;
    var val = 0;
    var isRoute = false;

    // iterate for rows
    for (var row = 0; row < rowCount; row++) {
        data.push( new Array() );

        // iterate for cells/columns inside rows
        for (var column = 0; column < columnCount; column++) {
            data[row].push({
                x: xpos,
                y: ypos,
                width: width,
                height: height,
                click: click,
                val: val,
                isRoute: isRoute
            })
            // increment the x position. I.e. move it over by 50 (width variable)
            xpos += width;
        }
        // reset the x position after a row is complete
        xpos = 1;
        // increment the y position for the next row. Move it down 50 (height variable)
        ypos += height;
    }
    return data;
  };
  $.fn.createGrid = function (toUpdate=undefined) {
    $('#mazeGrid').empty();
    var gridData
    if(toUpdate === undefined) {
      var gridColumnCount = $('#gridColumnCount').val()
      var gridRowCount = $('#gridRowCount').val()
      gridData = $.fn.gridData(gridColumnCount, gridRowCount);
    } else {
        gridData = Object.assign([], mazeGrid)
    }


    var grid = d3.select("#mazeGrid")
                  .append("svg")
                  .attr("width", "100%")
                  .attr("height", "100%")

    var row = grid.selectAll(".row")
                  .data(gridData)
                  .enter().append("g")
                  .attr("class", "row");
    var column = row.selectAll(".square")
                  .data(function(d) { return d; })
                  .enter().append("rect")
                  .attr("class","square")
                  .attr("x", function(d) { return d.x; })
                  .attr("y", function(d) { return d.y; })
                  .attr("width", function(d) { return d.width; })
                  .attr("height", function(d) { return d.height; })
                  .style("fill", "#fff")
                  .style("stroke", "yellow")
                  .style("fill", (d) => {
                    switch (d.val) {
                      case 1:
                        return 'black'
                        break;
                      case 2:
                        return 'green'
                        break
                      case 3:
                        return 'red'
                        break
                    }
                    if(d.isRoute === true) {
                      return 'blue'
                    } else {
                      return '#fff'
                    }
                  })
                  .on('click', function(d) {
                    d.click += 1;
                    if ((d.click)%4 == 0 ) {
                      d.val = 0;
                      d.click = d.val;
                      d3.select(this).style("fill","#fff");
                    }
                    if ((d.click)%4 == 1) {
                      d.val = 1;
                      d.click = d.val;
                      d3.select(this).style("fill","black");
                    }
                    if ((d.click)%4 == 2 && startPointSet === false) {
                      d.val = 2;
                      d.click = d.val;
                      d3.select(this).style("fill","green");
                      startPoint = {
                        column: Math.floor(d.x/15),
                        row: Math.floor(d.y/15)
                      }
                      startPointSet = true
                    }
                    if ((d.click)%4 == 3 && endPointSet === false) {
                      d.val = 3;
                      d.click = d.val;
                      d3.select(this).style("fill","red");
                      endPointSet = true
                    }
                  })
      return gridData
  }
  $('#createGrid').click(() => {
    mazeGrid = $.fn.createGrid()
  })
  $('#deleteGrid').click(() => {
    mazeGrid = new Array()
    $('#mazeGrid').empty();
  })

  $('#resetGrid').click(() => {
    if(mazeGrid.length > 0) {
      $('#mazeGrid').empty()
      mazeGrid = $.fn.createGrid()
      endPointSet = false
      startPointSet = false
    }
  })

  $.fn.solveGrid = function (currentRow, currentCol) {
    if(mazeGrid[currentRow][currentCol].val === 3) {
      return true
    } else if(mazeGrid[currentRow][currentCol].val === 1) {
      return false
    } else if (mazeGrid[currentRow][currentCol].isRoute === true) {
      return false
    }
    mazeGrid[currentRow][currentCol].isRoute = true

    if((currentRow < mazeGrid.length-1 && $.fn.solveGrid(currentRow+1,currentCol))||
    (currentCol > 0 && $.fn.solveGrid(currentRow, currentCol-1)) ||
    (currentRow > 0 && $.fn.solveGrid(currentRow-1,currentCol)) ||
    (currentCol < mazeGrid[0].length-1 && $.fn.solveGrid(currentRow, currentCol+1))) {
      return true
    }

    mazeGrid[currentRow][currentCol].isRoute = false
    return false
  }

  $('#solveGrid').click(() => {
    if(!mazeGrid.length > 0) {
      alert('please create a grid')
    } else {
      $('#solvingInfo').html = 'Solving Please Wait !'
        for(var i = 0;i<mazeGrid.length;i++){
          for(var j=0;j<mazeGrid[0].length;j++){
            mazeGrid[i][j].isRoute = false
          }
        }
        $.fn.solveGrid(startPoint.row, startPoint.column)
        $.fn.createGrid(mazeGrid)
    }
    $('#solvingInfo').innerHTML = 'Done'
  })
})
