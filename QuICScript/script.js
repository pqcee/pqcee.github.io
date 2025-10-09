const circuitsData = {
  Custom: {
    qubits: 5,
    quicscript: "",
  },
  Bell: {
    qubits: 2,
    quicscript: "HI,CN.",
  },
  GHZ: {
    qubits: 3,
    quicscript: "HII,CNI,ICN.",
  },
  Simon: {
    qubits: 4,
    quicscript:
      "HHHI,IIIX,IIIH,IIII,CCCN,IIII,IIIH,IIIX,HHHI,XXXI,IIHI,CCNI,IIHI,XXXI,HHHI,IIIX,IIIH,IIII,CCCN,IIII,IIIH,IIIX,HHHI,XXXI,IIHI,CCNI,IIHI,XXXI,HHHI.",
  },
  Grover2: {
    qubits: 3,
    quicscript: "HHI,IIX,IIH,III,CCN,III,IIH,IIX,HHI,XXI,IHI,CNI,IHI,XXI,HHI.",
  },
  Grover3: {
    qubits: 4,
    quicscript:
      "HHHI,IIIX,IIIH,IIII,CCCN,IIII,IIIH,IIIX,HHHI,XXXI,IIHI,CCNI,IIHI,XXXI,HHHI,IIIX,IIIH,IIII,CCCN,IIII,IIIH,IIIX,HHHI,XXXI,IIHI,CCNI,IIHI,XXXI,HHHI.",
  },
  Shor21: {
    qubits: 5,
    quicscript:
      "HHHII,IICIN,ICIIN,IIINC,ICICN,IIINC,IIIIX,CIINC,IIIIX,IIINC,CIICN,IIINC,IIHII,ICPII,CITII,IHIII,CPIII,HIIII.",
  },
  Shor15: {
    qubits: 7,
    quicscript:
      "HHHIIII,CIIIIIN,ICIININ,IIIIICN,IICIICN,IIIIICN,IIICNII,IICCNII,IIIIICN,IIImmmm,HIIIIII,CPIIIII,IHIIIII,CITIIII,ICPIIII,IIHIIII,IIIdddd",
  },
};

function configToPrama(config) {
  return Object.keys(config)
    .map((k) => k + "=" + config[k])
    .join("&");
}

function fileQuICScript(filehandle) {
  var QSfile = filehandle.files[0];

  // Display file name on frontend
  const name = filehandle.files[0]?.name;
  document.getElementById("filename").innerText = name;

  const fr = new FileReader();
  fr.readAsText(QSfile);
  fr.onload = function () {
    Module["FS_createDataFile"](
      "/",
      "tempQuICScript.qs",
      fr.result,
      true,
      true,
      true
    );

    document.getElementById("result").innerText = "executing QuICScript File";
    //			document.getElementById("qsfilecontent").innerHTML = "<textarea readonly >" + fr.result + "</textarea>";
    document.getElementById("qsfilecontent").innerText =
      "QuICScript File: \n" + fr.result;

    var result = Module.ccall(
      "QuICScript_file",
      "string",
      ["string"],
      ["tempQuICScript.qs"]
    );

    document.getElementById("result").innerText =
      "Result of File execution:\n" + result;

    Module["FS_unlink"]("tempQuICScript.qs");
    document.getElementById("QSfile").value = "";
  };
}

function setChoice(selObj) {
  const { value } = selObj;

  let qubits = 2;
  let quicscript = "HH.";

  if (circuitsData[value]) {
    qubits = circuitsData[value].qubits;
    quicscript = circuitsData[value].quicscript;
  }

  sendCircuitToIFrame(quicscript);
}

let config = {
  qubits: 5,
  columns: 8,
};

const rootIFrameSrc = "./react/index.html";

/**
 * @param {string} quicscript
 */
function sendCircuitToIFrame(quicscript) {
  config.quicscript = quicscript;
  paramsToIFrame(config);
}

/**
 * @param {Object} params
 */
function paramsToIFrame(params) {
  let iframe = document.getElementById("circuitIframe");
  let iframeSrc = rootIFrameSrc;
  if (Object.keys(params).length > 0) iframeSrc += "?" + configToPrama(config);
  iframe.src = iframeSrc;
}

function getParams() {
  const params = {};
  for (const [k, v] of new URLSearchParams(window.location.search).entries()) {
    params[k] = v;
  }
  return params;
}

function addNavigationLink(delaySeconds = 5) {
  // Get current query parameters
  const queryParams = window.location.search;
  const newUrl = `https://quicscript.pqcee.com${queryParams}`;

  const link = document.createElement("a");
  link.href = newUrl;
  link.textContent = `This site is deprecated. Redirecting to the new QuICScript site in ${delaySeconds} seconds...`;

  // Styling
  link.style.cssText = `
    display: block;
    margin: 0;
    padding: 16px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-decoration: none;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    font-weight: 500;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;
    border-bottom: 3px solid rgba(0, 0, 0, 0.1);
  `;

  // Hover effect
  link.addEventListener("mouseenter", () => {
    link.style.background = "linear-gradient(135deg, #764ba2 0%, #667eea 100%)";
    link.style.transform = "translateY(-2px)";
    link.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.15)";
  });

  link.addEventListener("mouseleave", () => {
    link.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    link.style.transform = "translateY(0)";
    link.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  });

  // Add to top of page
  document.body.insertBefore(link, document.body.firstChild);

  // Countdown timer
  let remaining = delaySeconds;
  const countdown = setInterval(() => {
    remaining--;
    if (remaining > 0) {
      link.textContent = `This site is deprecated. Redirecting to the new QuICScript site in ${remaining} seconds...`;
    } else {
      clearInterval(countdown);
      window.location.href = "https://quicscript.pqcee.com";
    }
  }, 1000);

  // Allow user to click link to redirect immediately
  link.addEventListener("click", (e) => {
    e.preventDefault();
    clearInterval(countdown);
    window.location.href = link.href;
  });
}

window.onload = () => {
  config.quicscript = circuitsData["Bell"].quicscript;

  /** Load params */
  const params = getParams();

  /** If params.quicscript exists, switch to customs */
  if (params.quicscript) {
    document.getElementById("choice").value = "Custom";
  }
  config = { ...config, ...params };

  /** Load iframe */
  paramsToIFrame(config);
  document.getElementById("circuitIframe").style.display = "block";

  /** Add navigation link */
  addNavigationLink();
};
