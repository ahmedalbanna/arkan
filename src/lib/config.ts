/**
 * Environment Configuration Validation
 *
 * This module validates all required environment variables at startup
 * to ensure the application has all necessary configuration.
 */


// Export individual configs for convenience

export const firebaseConfig = {
  apiKey: "AIzaSyDFB2d0Cx2UtglBPMyuevtCiRUWROb_fmk",
  authDomain: "docudec.firebaseapp.com",
  databaseURL: "https://docudec-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "docudec",
  storageBucket: "docudec.appspot.com",
  messagingSenderId: "201859762958",
  appId: "1:201859762958:web:602e322feffdcb11ed255f",
  measurementId: "G-K42VXYX7NQ"
} as const;

export const firebaseAdminConfig = {
    projectId: "docudec",
    clientEmail: "firebase-adminsdk-2maa7@docudec.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCXvtnHwHiPHIzk\nKaIZu/DOTffYoLNZa+a0JJVq/w81Z826+BGrnF0s0ldSM1NKLM/IMMDoi6AcG81C\nfqHleoG05B6BaxWFIU+nGozmmzhhClmmSTLFj2+Jtyvbw9UR1wy/XvEhDzKRCBef\nDuYks3a3+VdQnhq2wd+8SpDVEJ4zaHTNLv+jHJuSVTlHHf97Q5ClT9r2BX+0UX2u\nen1gtpqtjEBGanK8536is5y1N356jaYYGk6TZG/bZTrukLc5DshzegjCQDHNGR9k\nZRTVLnP4qAsRY27yamsHyki8ohBqLp2kaEzNzNvjvpywspOD87WJYHYAnyT21lRI\njB1axFOVAgMBAAECggEANa8h2d7YZ/z4RVILVKJeV4ZS7DMyMC0RweJ9cAyLQ2AV\ncxOHINjhR9WkaeLZkRDYc6D35m1bOAaH8AHf4dEc6TOZLT0GsIIv7VThy0XXxNEG\nFWOpECamFakVXZrjGvwjOOLsWL9JKvEbdjytpAdPtVeDkfRVTBm7vx/8LDzEUzgR\n1DPCw+jUmhBDgcn4wi3W3yHb/9t2vGHModrGO/FQI9slfUl2udFNdUnOOvJR3Toi\nV5Ch4YW1+Yd3fEl1XhENGw7QamsGLQ2OXMFvvU1kwxhsEASC7/Z6Kgx8O3XcpW36\n/zzcfhcw2XJ5ynrfoTWLtM4IiyLyt8lUycGYurKM0wKBgQDVGtMvmmb9n6g2bdJs\n3BgRci+nhktKkosIjAsrmukE1XUegGBRyYtamz5Zvfokg4Pz8H4mzYQw1XR8D9z6\nPx0QV0/CEt7KDSeExRToQH8PAFM2rk8gntN0IYPdoGMyGyJdcz4Sj3wiKK7278+X\nRdOnmOCZ2hKBK1of/uW9eBRpQwKBgQC2SjcfWnsaYUdirShSleke/EOdXXW2F2sD\nPa40Y59gUEiga0Nqssz2zXioF02juffO4G6Wkk/KsxePuG2B/Ms14C2dzfc9x9dg\nSYjus8a1JENTyegrJLhQRKe5FziAedOIL1sRCDA+D2cU4UTr0r7uCuQn8qNuS/kk\nZ1jTV402RwKBgQCiLVb4zEWC0IVAXtWcGOeMJ10S3cXgy6NZbtJ1bd/V2OjXvJUQ\nyRPvcWPDAiwiq5+4/pXSy+bFDz0lySC/pVZmADxnktrP47DmfuHJWoQXk4TAgWkg\nhx6fK35iJNQ45qOBgNmFYIL0sAdvT9Oo6PAJhPOwwmAAw1BEN0T5qy/FZwKBgQCl\nWnzV/AVe0I8oe1nwT/u/F6VdwcFdA7EWp4S2EQgpHapDmgj1aGt0FL41+615rt+S\n0RJ/kwi+HeZpgCoVl3Hd1RSL6KE1cWl09j84B+tftR09jBEF0bE/Xoel5eJi6B9x\nkUNSF9Nq+B3RWuZh5DE9TLPZaMfG7TN6SiTQ0MJPUQKBgAzhBdUnSakOgjtB9jax\nNQo64DpYHvDVC3xswGZdB8swuwZjsoNT/JV4vOQ1YgxVm7KTUWKmKTdGYfWnQ9EC\n0gdxgy7MmmEuTN6/riaer22vm63BaHYa2BN5p4jtMJuA0eg4CTJAm2ofHKv3K4JK\nlOhAb3IjFTYr+b6iuwhMXdWz\n-----END PRIVATE KEY-----\n",
};


export const ollamaConfig = {
  serverAddress: "http://localhost:11434",
} as const;
