export function register(){
  // Only register service worker in production builds to avoid dev cache issues
  try{
    if(import.meta && import.meta.env && import.meta.env.PROD && 'serviceWorker' in navigator){
      navigator.serviceWorker.register('/sw.js').catch(()=>{})
    }
  }catch(e){
    // fallback: do not register in unknown environments
  }
}
