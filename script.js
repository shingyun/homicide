

//Set up a drawing environment
var m = {t:85,r:100,b:50,l:100},
	w = document.getElementById('plot1').clientWidth - m.l - m.r,
	h = document.getElementById('plot1').clientHeight - m.t - m.b;
var plot1 = d3.select('.plot1')
	.append('svg')
	.attr('width', w + m.l + m.r)
	.attr('height', h + m.t + m.b)
	.append('g')
	.attr('transform','translate(100,50)');

d3.queue()
	.defer(d3.csv,'./data/homicide.csv',parse)
	.await(dataLoaded);

function dataLoaded(err,data){

   var nestByMon = d3.nest().key(function(d){return d.date.getMonth();})
       .entries(data);
   console.log(nestByMon);

   month = nestByMon.map(function(d){return d.key})
   console.log(month);


   var nestByYear = d3.nest().key(function(d){return d.year;})
       .entries(data);

   year = nestByYear.map(function(d){return d.key});

   
   var nestByCause = d3.nest().key(function(d){return d.cause;})
       .entries(data);
    
   cause = nestByCause.map(function(d){return d.key})

   console.log(cause);
   var scaleCause = d3.scaleBand()
       .domain(cause)
       .range([0,w])
 
   var axisCause = d3.axisTop()
       .scale(scaleCause)
       .tickSize(null);

   plot1.append('g')
        .attr('class','causeAxis')
        .attr('transform','translate(50,0)')
        .call(axisCause)


  var scaleMonth = d3.scaleBand()
    .domain(month)
    .range([0,w])
    var monthText = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var axisMonth = d3.axisTop()
    .scale(scaleMonth)
    .tickSize(-h)


  axisMonth.tickFormat(function(d){
  	return monthText[d]
  });

  plot1.append('g')
    .attr('class','monthAxis')
    .attr('transform','translate(0,0)')
    .style('stroke-dasharray', ('6, 3'))
    .call(axisMonth);

  var scaleYear = d3.scaleBand()
    .domain(year)
    .range([800,0]);

  var axisYear = d3.axisLeft()
    .scale(scaleYear)
    .tickSize(-w);

  plot1.append('g')
    .attr('class','yearAxis')
    .attr('transform','translate(0,0)')
    .style('stroke-dasharray', ('6, 3'))
    .call(axisYear);

   var simulation = d3.forceSimulation(data);

   var chargeForce = d3.forceManyBody()
    .strength(0);// -30 is by defult(for forceManyBody)

   var forceX = d3.forceX()
    .x(function(d){return scaleMonth(d.date.getMonth());});

   var forceY = d3.forceY()
    .y(function(d){return scaleYear(d.year)});

   var collide = d3.forceCollide()// collide 讓所有elements都不重疊
    .radius(5);

  
   

   plot1.selectAll('.monthText')
        .data(monthText)
        .enter()
        .append('text')
        .attr('x',function(d){
        	return scaleMonth(d)})

   var nodes = plot1.selectAll('.node')
    .data(data)
    .enter()
    .append('g')
    .attr('class','node')
    .attr('transform','translate(150,150)');

    nodes.append('circle')
     .attr('r',8)
     .style('fill','#92140C')
     .style('opacity',.8);

   simulation
        .force('charge',chargeForce)
        .force('positionX',forceX)
        .force('positionY',forceY)
        .force('collide',collide)
        .on('tick.position',function(){
          
          plot1.selectAll('.node')
              .attr('transform',function(d){ 
           return 'translate('+ (d.x+40)+','+ (d.y+35)+')'});
         })
        .on('end',function(){
            console.log('simulation end');
        });


   d3.select('.button')
     .on('click',function(d){
   
       d3.selectAll('.monthText').style('opacity',0);
       d3.selectAll('.monthAxis').style('opacity',0);
       d3.selectAll('.causeAxis').style('opacity',1);

       simulation
        .force('charge',chargeForce)
        .force('positionX',d3.forceX()
                .x(function(d){return scaleCause(d.cause)}))
        .force('positionY',forceY)
        .force('collide',collide)
        .alpha(1)
        .restart()
        .on('tick.position',function(){
          
          plot1.selectAll('.node')
              .attr('transform',function(d){ 
           return 'translate('+ (d.x+100)+','+ (d.y+35)+')'});
         })
        .on('end',function(){
            console.log('simulation end');
        });

     });



}



function parse(d){
	return {
		year:d.Year,
		date:parseTime(d.Date),
		gender:d.Gender,
		cause:d['Cause of Death /Weapon']
	}
}

function parseTime(time){

	var	date = time.split(' ')[0].split('/'),
		year = '20'+date[2],
		month = date[0],
		day = date[1];

	return new Date(year,month-1,day);
}