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

let config = {};

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
};
