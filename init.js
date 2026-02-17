//DRAGGABILLY
var $draggable = $('.draggable').draggabilly({
  handle: '.handle',
});

// Update copyright date - fixed to 12/29/25
const copyrightEl = document.getElementById('copyright');
if (copyrightEl) {
    copyrightEl.textContent = '12/29/25 ©';
}

//ANIMATION
const BTLDR = {
    svg: document.getElementById('animation-svg'),
    rnd: () => Math.random()
};

if (BTLDR.svg) {
    console.log('SVG found, starting animation');
    const N="http://www.w3.org/2000/svg",M=(t,a={})=>{let e=document.createElementNS(N,t);for(let k in a)e.setAttribute(k,a[k]);return e};BTLDR.svg.setAttribute("viewBox","0 0 400 400");BTLDR.svg.setAttribute("preserveAspectRatio","xMidYMid meet");BTLDR.svg.setAttribute("width","100%");BTLDR.svg.setAttribute("height","100%");BTLDR.svg.appendChild(M("rect",{x:0,y:0,width:400,height:400,fill:"transparent"}));const C=p=>BTLDR.rnd()<p,R=(m,x)=>m+BTLDR.rnd()*(x-m),RY=([x,y,z],a)=>[x*Math.cos(a)+z*Math.sin(a),y,-x*Math.sin(a)+z*Math.cos(a)],P=([x,y,z])=>{let s=350,d=3,f=s/(z+d+6);return[200+x*f,200-y*f,z]},PL=(p,f,s)=>M("polygon",{points:p.map(([x,y])=>x+","+y).join(" "),fill:f,stroke:s||"#000","stroke-width":.5}),SM=(sl=16,st=12,S=[1,1,1],H=[0,0,0])=>{let p=[],F=[];for(let i=0;i<=sl;i++){let u=i/sl*2*Math.PI;for(let j=0;j<=st;j++){let v=j/st*Math.PI,x=Math.cos(u)*Math.sin(v)*S[0]+H[0],y=Math.cos(v)*S[1]+H[1],z=Math.sin(u)*Math.sin(v)*S[2]+H[2];p.push([x,y,z])}}let r=st+1;for(let i=0;i<sl;i++)for(let j=0;j<st;j++){let a=i*r+j,b=(i+1)*r+j;F.push([a,a+1,b+1,b])}return{pts:p,faces:F}},NM=(sg=20,rg=6,rB=.35,rT=.15,h=1,H=[0,0,0])=>{let p=[],F=[];for(let j=0;j<=rg;j++){let t=j/rg,z=t*h,r=rB*(1-t)+rT*t+.07*Math.sin(Math.PI*t);for(let i=0;i<=sg;i++){let a=i/sg*2*Math.PI;p.push([Math.cos(a)*r,Math.sin(a)*r,z])}}let c=sg+1;for(let j=0;j<rg;j++)for(let i=0;i<sg;i++){let a=j*c+i,b=a+c;F.push([a,a+1,b+1,b])}return{pts:p.map(q=>[q[0]+H[0],q[1]+H[1],q[2]+H[2]]),faces:F}},DM=(sg=32,r=1,H=[0,0,0])=>{let p=[[0,0,0]],F=[];for(let i=0;i<sg;i++){let a=i/sg*2*Math.PI;p.push([Math.cos(a)*r,Math.sin(a)*r,0])}for(let i=1;i<=sg;i++)F.push([0,i,i%sg+1]);return{pts:p.map(q=>[q[0]+H[0],q[1]+H[1],q[2]+H[2]]),faces:F}};let parts=[];parts.push({mesh:SM(24,18,[1.2,1.8,1.2],[0,0,0]),color:"#c97a3d"});const E=(x,y,z)=>{parts.push({mesh:SM(12,8,[.35,.25,.15],[x,y,z]),color:"#fff"}),parts.push({mesh:SM(12,8,[.1,.1,.05],[x,y,z+.15]),color:"#000"})};if(C(.9))E(R(-.7,-.5),R(.5,.9),1.3);if(C(.9))E(R(.5,.7),R(.5,.9),1.3);if(C(.85))parts.push({mesh:NM(20,6,.35,.15,1,[R(-.2,.2),R(.2,.4),1.2]),color:"#e67e22"});if(C(.9))parts.push({mesh:DM(24,.6,[R(-1.8,-1.4),R(-.3,.3),0]),color:"#f5a5c5"});if(C(.9))parts.push({mesh:DM(24,.6,[R(1.4,1.8),R(-.3,.3),0]),color:"#f5a5c5"});if(C(.7)){parts.push({mesh:SM(12,8,[.5,.25,.15],[R(-.5,-.3),R(-.2,.1),1.15]),color:"#111"}),parts.push({mesh:SM(12,8,[.5,.25,.15],[R(.3,.5),R(-.2,.1),1.15]),color:"#111"})}if(C(.8))parts.push({mesh:SM(16,8,[.7,.25,.12],[R(-.2,.2),R(-.4,-.2),1.15]),color:"#d32f2f"});if(C(.9))parts.push({mesh:SM(16,8,[.9,.35,.5],[R(-.9,-.7),-2,R(-.2,.2)]),color:"#1976d2"});if(C(.9))parts.push({mesh:SM(16,8,[.9,.35,.5],[R(.7,.9),-2,R(-.2,.2)]),color:"#1976d2"});
    
    // Animation control variables
    let ang = 0;
    let autoRotate = true;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let svgX = 50;
    let svgY = 50;
    
    // Initialize SVG position
    const rect = BTLDR.svg.getBoundingClientRect();
    svgX = (rect.left + rect.width / 2) / window.innerWidth * 100;
    svgY = (rect.top + rect.height / 2) / window.innerHeight * 100;
    BTLDR.svg.style.left = svgX + '%';
    BTLDR.svg.style.top = svgY + '%';
    BTLDR.svg.style.transform = 'translate(-50%, -50%)';
    
    // Drag functionality
    BTLDR.svg.addEventListener('mousedown', (e) => {
        isDragging = true;
        autoRotate = false;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        const rect = BTLDR.svg.getBoundingClientRect();
        svgX = (rect.left + rect.width / 2) / window.innerWidth * 100;
        svgY = (rect.top + rect.height / 2) / window.innerHeight * 100;
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - dragStartX;
            const deltaY = e.clientY - dragStartY;
            
            // Update position (both X and Y)
            svgX += (deltaX / window.innerWidth) * 100;
            svgY += (deltaY / window.innerHeight) * 100;
            svgX = Math.max(0, Math.min(100, svgX));
            svgY = Math.max(0, Math.min(100, svgY));
            
            BTLDR.svg.style.left = svgX + '%';
            BTLDR.svg.style.top = svgY + '%';
            
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            
            // Rotate based on horizontal drag
            ang += deltaX * 0.005;
        }
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        autoRotate = true;
    });
    
    // Wheel rotation
    BTLDR.svg.addEventListener('wheel', (e) => {
        e.preventDefault();
        autoRotate = false;
        ang += e.deltaY * 0.001;
    });
    
    function D(){
        BTLDR.svg.innerHTML="";
        let F=[];
        for(const o of parts){
            let pts=o.mesh.pts.map(p=>RY(p,ang)).map(P);
            for(const f of o.mesh.faces){
                let poly=f.map(i=>pts[i]),z=poly.reduce((s,[,,z])=>s+z,0)/f.length;F.push({poly,fill:o.color,z});
            }
        }
        F.sort((a,b)=>a.z-b.z);
        for(const f of F)BTLDR.svg.appendChild(PL(f.poly,f.fill));
        if(autoRotate) ang += 0.01;
        requestAnimationFrame(D);
    }
    D();
} else {
    console.error('SVG element not found');
}
