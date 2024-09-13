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

const defaultConfig = {
  qubits: 5,
  columns: 8,
  qibo: false,
  input: true,
};

const defaultIframeSrc =
  "https://pqcee.github.io/quicscript-dev-react/?" +
  configToPrama(defaultConfig);

function sendCircuitToIFrame(quicscript) {
  var iframe = document.getElementById("circuitIframe");
  iframe.src = defaultIframeSrc + `&quicscript=${quicscript}`;
}

window.onload = () => {
  const iframe = document.getElementById("circuitIframe");
  iframe.src = defaultIframeSrc;
  iframe.style.display = "block";
};
