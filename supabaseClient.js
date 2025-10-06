(function(){
  if (window.waitForSupabase) {
    return;
  }
  if (window.supabase) {
    window.supabaseReady = Promise.resolve(window.supabase);
    window.waitForSupabase = async function(){
      return window.supabase;
    };
    return;
  }
  let resolveClient;
  window.supabaseReady = new Promise((resolve) => {
    resolveClient = resolve;
  });
  function resolveIfReady() {
    if (window.supabase && resolveClient) {
      resolveClient(window.supabase);
      resolveClient = null;
    }
  }
  window.waitForSupabase = async function waitForSupabase(){
    if (window.supabase) {
      return window.supabase;
    }
    return window.supabaseReady;
  };
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
  script.defer = true;
  script.onload = function(){
    window.supabase = supabasejs.createClient(window.supabaseUrl, window.supabaseAnonKey);
    resolveIfReady();
  };
  script.onerror = function(){
    console.error('Failed to load Supabase client.');
  };
  document.head.appendChild(script);
})();
