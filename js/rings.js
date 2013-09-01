(function(window, $, undefined){
  //Behaviours are manually set by user click to increase/ click to reduce
  //behaviours values effect rate of change of feelings
  //does learning = effectiveness? remove effectiveness? yes, because effectiveness is not only based on learning? some bhaviours learning directly effect learning but not necessarily feelings
  var effect = [ 
  { "nv":"Suspicion", "pv":"Trust","val":0, 
    "cause":{"Closeness":3, "Openness":3, "Listening":3 }},
  { "nv":"Fear", "pv":"Courage","val":0,
    "cause":{"Group Reflection":3, "Success stories":3}},
  { "nv":"Frustration", "pv":"Fellowship","val":0,
    "cause":{"Appreciation":3, "Vulnerability":3}},
  { "nv":"Us and Them", "pv":"How can we help?","val":0, "purpose":true}];

  var cause = [
  { "nv":"Separation", "pv":"Closeness", "val":-30},
  { "nv":"Concealment", "pv":"Openness", "val":-30},
  { "nv":"Ignoring", "pv":"Listening", "val":-30},
  { "nv":"Blame", "pv":"Group Reflection","val":-30},
  { "nv":"Scare stories", "pv":"Success stories", "val":-30},
  { "nv":"Punishment", "pv":"Appreciation", "val":-30},
  { "nv":"Defensiveness", "pv":"Vulnerability", "val":-30}]

  var fps = 20;
  var clickInterval;

  $(function(){
    $(document).on('mouseup touchend',function(){
      clearInterval(clickInterval);
      return false;
    });

    setInterval(function(){
      redraw();
      applyChanges();
    }, 1000/fps);
    
    function applyChanges()
    {
      $.each(effect, function(i,e){
        if(e.purpose)
          e.val = d3.mean(effect, function(e){ return e.val; });
        else
        {
          e.val += calculateChange(e);
          if(e.val > 100) { e.val = 100; }
          if(e.val < -100) { e.val = -100; }
        }
      });
    }

    function calculateChange(effect){
      var change = 0;
      $.each(effect.cause, function(ec,weight){ 
        $.each(cause, function(i,c){
          if(c.pv == ec)
            change += c.val * weight;
        });
      });
      return (change /(cause.length *50)) - ((effect.val^2)/(100^2));
    }

    function redraw(){
      var datum = {"x":350, "y":300};
      var svg = d3.select("svg");
      var causeAngle = (2.0*Math.PI)/cause.length;
      var effectAngle = (2.0*Math.PI)/(effect.length-1);
      
      svg.selectAll(".effect")
        .data(effect)
          .attr("r", function(d) { return Math.abs(d.val); })
          .enter()
          .append("circle")
          .attr("cx", function(d,i) { return effectX(d,i); })
          .attr("cy", function(d,i) { return effectY(d,i);  })
          .attr("class", "effect")
          .classed("purpose", function(d){ return d.purpose; })

      svg.selectAll(".effect-text")
      .data(effect)
        .text(function(d){ return d.val < 0 ? d.nv : d.pv; })
        .classed("negative-text", function(d){ return d.val < 0 })
        .classed("positive-text", function(d){ return d.val >= 0 })
        .enter()
        .append("text")
        .classed("effect-text", true)
        .attr("x", function(d,i) { return effectX(d,i); })
        .attr("y", function(d,i) { return effectY(d,i);  })

      svg.selectAll(".cause")
      .data(cause)
        .attr("r", function(d,i){ return Math.abs(d.val);})
        .enter()
        .append("circle")
        .attr("class", "cause")
        .attr("cx", function(d,i) { return causeX(d,i); })
        .attr("cy", function(d,i) { return causeY(d,i); })
        .attr("data-id", function(d,i){ return i; })
        .on('mousedown', adjustCause)
        .on('touchstart', adjustCause);

      svg.selectAll(".cause-text")
      .data(cause)
        .text(function(d){ return d.val < 0 ? d.nv : d.pv; })
        .classed("negative-text", function(d){ return d.val < 0 })
        .classed("positive-text", function(d){ return d.val >= 0 })
        .enter()
        .append("text")
        .attr("class", "cause-text")
        .attr("x", function(d,i) { return causeX(d,i); })
        .attr("y", function(d,i) { return causeY(d,i);  })
        .attr("data-id", function(d,i){ return i; })
        .on('mousedown', adjustCause)
        .on('touchstart', adjustCause);

      function causeX(d,i){
        return datum.x + (250 * Math.cos(i*causeAngle));
      }

      function causeY(d,i){
        return datum.y + (250 * Math.sin(i*causeAngle)); 
      }

      function effectX(d,i){
        if(d.purpose){ return datum.x; }
        return datum.x + (125 * Math.cos(i*effectAngle));
      }

      function effectY(d,i){
        if(d.purpose){ return datum.y; }
        return datum.y + (125 * Math.sin(i*effectAngle)); 
      }

      function adjustCause(d){
          var ev = d3.event;
          clearInterval(clickInterval);
          clickInterval = setInterval(function(){
            d.val += ev.shiftKey || (ev.touches && ev.touches.length == 2) ? -1 : 1;
          }, 1000/fps);
          d3.event.preventDefault();
      }
    }

  });
})(Window, jQuery);
