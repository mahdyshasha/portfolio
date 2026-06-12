(function(){
  // Small interactive helpers: smooth scrolling, nav toggle, year
  document.addEventListener('DOMContentLoaded',function(){
    // set year
    var y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();

    // smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.addEventListener('click',function(e){
        var href=this.getAttribute('href'); if(href==="#") return;
        var el=document.querySelector(href); if(!el) return;
        e.preventDefault(); el.scrollIntoView({behavior:'smooth',block:'start'});
        // close mobile nav if open
        var navList=document.getElementById('nav-list');
        if(navList && navList.style.display==='block') navList.style.display='none';
      });
    });

    // mobile nav toggle
    var toggle=document.querySelector('.nav-toggle');
    var navList=document.getElementById('nav-list');
    if(toggle && navList){
      toggle.addEventListener('click',function(){
        var open = navList.style.display==='block';
        navList.style.display = open ? 'none' : 'block';
        toggle.setAttribute('aria-expanded', String(!open));
      });
    }

    // simple reveal on scroll
    var reveal = function(){
      document.querySelectorAll('.project, .summary-card, .skill-card, .hero-card').forEach(function(el){
        var r=el.getBoundingClientRect();
        if(r.top < (window.innerHeight || document.documentElement.clientHeight) - 40){
          el.style.opacity=1; el.style.transform='translateY(0)';
        }
      });
    };
    // init styles
    document.querySelectorAll('.project, .summary-card, .skill-card, .hero-card').forEach(function(el){el.style.opacity=0;el.style.transform='translateY(8px)';el.style.transition='all .6s cubic-bezier(.2,.9,.2,1)';});
    reveal(); window.addEventListener('scroll',reveal,{passive:true});
  });
})();
