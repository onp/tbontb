var storyData

var createGraph = function(){
    var storyBox = d3.select("#story-box")
    var force = d3.layout.force()
        .nodes(storyData.pages)
        .links(storyData.links)
        .linkDistance(30)
        .size([storyBox.style("width").slice(0,-2),storyBox.style("height").slice(0,-2)])
        .start();

    window.addEventListener("resize",function(){
        force.size([storyBox.style("width").slice(0,-2),storyBox.style("height").slice(0,-2)]);
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
