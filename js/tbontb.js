var storyData
var fieldWidth
var fieldHeight

var createGraph = function(){
    var storyBox = d3.select("#story-box")
    fieldWidth = storyBox.style("width").slice(0,-2)
    fieldHeight = storyBox.style("height").slice(0,-2)
    var force = d3.layout.force()
        .nodes(storyData.pages)
        .links(storyData.links)
        .linkDistance(30)
        .size([fieldWidth,fieldHeight])
        .start();

    window.addEventListener("resize",function(){
        fieldWidth = storyBox.style("width").slice(0,-2)
        fieldHeight = storyBox.style("height").slice(0,-2)
        force.size([fieldWidth,fieldHeight]);
        force.resume()
    })
        
    var visLinks = storyBox.selectAll(".link")
        .data(storyData.links)
        .enter().append("line")
            .attr("class","link")
            .classed("skull",function(d){return d.skull})
            .classed("picture",function(d){return d.type === "picture"})
            visLinks.attr("marker-end","url(#plain-arrow)")
        
    var visNodes = storyBox.selectAll(".page")
        .data(storyData.pages)
        .enter().append("circle")
            .attr("class",function(d){return "page " + d.character + " p" + d.number})
            .classed("end",function(d){return d.isEnd})
            .classed("picture",function(d){return d.isPicture})
            .attr("r",8)
            .call(force.drag)
    
    force.on("tick",function(){
        storyData.pages.forEach(function(o,i){
            if (o.x < 1){o.x = 1}
            if (o.x < 20){o.x += 3/o.x}
            if (o.y < 1){o.y = 1}
            if (o.y < 20){o.y += 3/o.y}
            if (o.x > (fieldWidth - 1)){o.x = fieldWidth - 1}
            if (o.x > (fieldWidth - 20)){o.x -= 3/(fieldWidth - o.x)}
            if (o.y > (fieldHeight - 1)){o.y = fieldHeight - 1}
            if (o.y > (fieldHeight - 20)){o.y -= 3/(fieldHeight - o.y)}
            
        })
        visLinks.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
            
        visNodes.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    })
        
        
        
    
}

var onGraphDataReceived = function(){
    storyData = JSON.parse(this.responseText);
    storyData.links = [];
    var oPages = storyData.pages.length
    for (var i = 0; i<oPages; i++){
        var page = storyData.pages[i];
        for (var j = 0; j < page.links.length; j++){
            var link = page.links[j];
            if (storyData.pages[link.target] === undefined){
                storyData.pages[link.target] = {"character":"notEntered","number":link.target}
            }
            link.target = storyData.pages[link.target];
            link.source = page;
            storyData.links.push(link);
        }
    }
    for (var i = 0; i<storyData.pages.length; i++){
        if (storyData.pages[i] === undefined){
            storyData.pages[i] = {"character":"notEntered","number":i}
        }
    }
    console.log(storyData)
    createGraph()
}

window.addEventListener("load",function(){
    var dataGetter = new XMLHttpRequest();
    dataGetter.onload = onGraphDataReceived;
    dataGetter.open("get","data/tbontb.json")
    dataGetter.send()
})
