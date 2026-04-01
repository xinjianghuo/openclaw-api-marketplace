/**
 * Advanced Stealth Configuration for Playwright
 *
 * Injects scripts to override automation detection vectors
 * Use with context.addInitScript() or page.addInitScript()
 */

const stealthScript = () => {
  // === 1. Navigator properties ===
  const overrideNavigator = () => {
    // Remove webdriver flag
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined
    });

    // Spoof plugins (Chrome typical count: 5-10)
    const pluginCount = Math.floor(Math.random() * 4) + 5; // 5-8
    Object.defineProperty(navigator, 'plugins', {
      get: () => Array(pluginCount).fill(0).map((_, i) => ({
        name: `Plugin ${i}`,
        filename: 'internal-npapi-plugin.dll',
        description: 'NPAPI Plugin',
        version: '1.0.0'
      }))
    });

    // Languages (match Chrome default)
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en']
    });

    // Platform (Windows 10)
    Object.defineProperty(navigator, 'platform', {
      get: () => 'Win32'
    });

    // Hardware concurrency (typical desktops)
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: () => 8 // or 4, 16, random
    });

    // Device memory (in GB)
    Object.defineProperty(navigator, 'deviceMemory', {
      get: () => 8 // 4, 8, 16
    });
  };

  // === 2. Chrome runtime object ===
  const overrideChrome = () => {
    window.chrome = {
      runtime: {},
      loadTimes: () => ({}, {}, {}, {}, {}),
      csi: () => ({}, {}, {}, {}, {}),
      app: {}
    };

    // chrome.csi (renderer timing)
    if (!window.chrome.csi) {
      window.chrome.csi = () => ({});
    }
  };

  // === 3. Permissions API ===
  const overridePermissions = () => {
    const originalQuery = navigator.permissions.query;
    navigator.permissions.query = (parameters) => {
      if (parameters.name === 'notifications') {
        return Promise.resolve({ state: Notification.permission });
      }
      // For geolocation, return prompt instead of denied (more realistic)
      if (parameters.name === 'geolocation') {
        return Promise.resolve({ state: 'prompt' });
      }
      return originalQuery(parameters);
    };
  };

  // === 4. WebGL Fingerprint ===
  const overrideWebGL = () => {
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      // UNMASKED_VENDOR_WEBGL: return real GPU vendors
      if (parameter === 37445) {
        const vendors = [
          'Google Inc. (NVIDIA)', // 常见 headless 伪装
          'Intel Inc.',
          'AMD',
          'NVIDIA Corporation'
        ];
        return vendors[Math.floor(Math.random() * vendors.length)];
      }
      // UNMASKED_RENDERER_WEBGL
      if (parameter === 37446) {
        const renderers = [
          'ANGLE (NVIDIA GeForce GTX 1080 Direct3D11 vs_5_0 ps_5_0)',
          'Mesa DRI Intel(R) UHD Graphics 630 (CFL)',
          'AMD Radeon RX 580 (POLARIS10, DRM 3.35.0, 5.4.0-42-generic)'
        ];
        return renderers[Math.floor(Math.random() * renderers.length)];
      }
      return getParameter.call(this, parameter);
    };

    // Add small noise to WebGL hash
    const getExtension = WebGLRenderingContext.prototype.getExtension;
    WebGLRenderingContext.prototype.getExtension = function(name) {
      const ext = getExtension.call(this, name);
      if (ext && name === 'WEBGL_debug_renderer_info') {
        // Already handled above
      }
      return ext;
    };
  };

  // === 5. AudioContext Fingerprint ===
  const overrideAudioContext = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const originalCreateAnalyser = AudioContext.prototype.createAnalyser;
    AudioContext.prototype.createAnalyser = function() {
      const analyser = originalCreateAnalyser.apply(this, arguments);

      // Override getFloatFrequencyData to add noise
      const originalGetFloat = analyser.getFloatFrequencyData;
      analyser.getFloatFrequencyData = function(array) {
        originalGetFloat.call(this, array);
        // Add imperceptible noise
        for (let i = 0; i < array.length; i++) {
          array[i] += (Math.random() - 0.5) * 1e-10;
        }
      };

      return analyser;
    };

    // Override getChannelData (for AudioBuffer)
    const originalGetChannelData = AudioBuffer.prototype.getChannelData;
    AudioBuffer.prototype.getChannelData = function(channel) {
      const data = originalGetChannelData.call(this, channel);
      // Add noise
      for (let i = 0; i < data.length; i++) {
        data[i] += (Math.random() - 0.5) * 1e-10;
      }
      return data;
    };
  };

  // === 6. Canvas Fingerprint ===
  const overrideCanvas = () => {
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function(type) {
      const canvas = this;
      const ctx = canvas.getContext('2d');

      // Add tiny noise to every pixel
      if (type === 'image/png') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          data[i] += Math.floor((Math.random() - 0.5) * 2);     // R
          data[i+1] += Math.floor((Math.random() - 0.5) * 2);   // G
          data[i+2] += Math.floor((Math.random() - 0.5) * 2);   // B
        }
        ctx.putImageData(imageData, 0, 0);
      }

      return originalToDataURL.apply(this, arguments);
    };
  };

  // === 7. WebRTC (optional: spoof local IP) ===
  const overrideRTCPeerConnection = () => {
    const originalGetStats = RTCPeerConnection.prototype.getStats;
    RTCPeerConnection.prototype.getStats = async function() {
      const stats = await originalGetStats.apply(this, arguments);
      // Could modify local IP here if needed
      return stats;
    };
  };

  // === 8. Headless detection bypass ===
  const overrideHeadless = () => {
    // Check for headless chrome
    if (window.navigator.webdriver || window.chrome && window.chrome.loadTimes) {
      // That's okay, we already spoofed it
    }

    // Check for Chrome headless specific properties
    window.chrome = window.chrome || {};
    if (!window.chrome.runtime) {
      window.chrome.runtime = {};
    }
  };

  // === 9. Screen resolution & color depth ===
  const overrideScreen = () => {
    Object.defineProperty(screen, 'width', { get: () => 1920 });
    Object.defineProperty(screen, 'height', { get: () => 1080 });
    Object.defineProperty(screen, 'availWidth', { get: () => 1920 });
    Object.defineProperty(screen, 'availHeight', { get: () => 1040 });
    Object.defineProperty(screen, 'colorDepth', { get: () => 24 });
    Object.defineProperty(screen, 'pixelDepth', { get: () => 24 });
  };

  // === 10. Touch support (desktop = false, mobile = true) ===
  const overrideTouch = () => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      get: () => 0 // desktop
    });
  };

  // === EXECUTE ALL OVERRIDES ===
  try {
    overrideNavigator();
    overrideChrome();
    overridePermissions();
    overrideWebGL();
    overrideAudioContext();
    overrideCanvas();
    overrideRTCPeerConnection();
    overrideHeadless();
    overrideScreen();
    overrideTouch();

    // Hide console.log in production (optional)
    if (typeof window !== 'undefined') {
      // const originalLog = console.log;
      // console.log = function() {}; // Silence
    }
  } catch (e) {
    console.warn('Stealth injection error:', e);
  }
};

// Export for Playwright
if (typeof module !== 'undefined' && module.exports) {
  module.exports = stealthScript;
}

// For direct injection in browser
// eval(stealthScript.toString().replace(/^.*?{/, '').replace(/}$/, ''));
