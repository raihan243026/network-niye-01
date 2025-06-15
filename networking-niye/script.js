document.addEventListener("DOMContentLoaded", () => {
    // Fetch User IP
    fetch("https://api64.ipify.org?format=json")
        .then(response => response.json())
        .then(data => {
            document.getElementById("userIP").textContent = data.ip;
        })
        .catch(() => {
            document.getElementById("userIP").textContent = "Unable to retrieve.";
        });

    // OSI and TCP/IP Model Hover/Tap Effect
    const osiLayers = document.querySelectorAll(".osi-layer");
    const tcpipLayers = document.querySelectorAll(".tcpip-layer");
    const handshakeSteps = document.querySelectorAll(".handshake-step");
    const osiDescription = document.getElementById("osiDescription");
    const tcpipDescription = document.getElementById("tcpipDescription");
    const handshakeDescription = document.getElementById("handshakeDescription");

    osiLayers.forEach(layer => {
        layer.addEventListener("mouseover", () => {
            osiDescription.textContent = `${layer.dataset.layer}: ${layer.dataset.info}`;
        });
        layer.addEventListener("touchstart", (e) => {
            e.preventDefault(); // Prevent scrolling on tap
            osiDescription.textContent = `${layer.dataset.layer}: ${layer.dataset.info}`;
        });
        layer.addEventListener("mouseleave", () => {
            osiDescription.textContent = "Hover or tap a layer to see its purpose, protocols, and examples.";
        });
    });

    tcpipLayers.forEach(layer => {
        layer.addEventListener("mouseover", () => {
            tcpipDescription.textContent = `${layer.dataset.layer}: ${layer.dataset.info}`;
        });
        layer.addEventListener("touchstart", (e) => {
            e.preventDefault(); // Prevent scrolling on tap
            tcpipDescription.textContent = `${layer.dataset.layer}: ${layer.dataset.info}`;
        });
        layer.addEventListener("mouseleave", () => {
            tcpipDescription.textContent = "Hover or tap a layer to see its purpose and protocols.";
        });
    });

    handshakeSteps.forEach(step => {
        step.addEventListener("mouseover", () => {
            handshakeDescription.textContent = `${step.dataset.step}: ${step.querySelector('p').textContent}`;
        });
        step.addEventListener("touchstart", (e) => {
            e.preventDefault(); // Prevent scrolling on tap
            handshakeDescription.textContent = `${step.dataset.step}: ${step.querySelector('p').textContent}`;
        });
        step.addEventListener("mouseleave", () => {
            handshakeDescription.textContent = "Hover or tap a step to see details.";
        });
    });

    // Scroll Animation
    const elements = document.querySelectorAll(".animate-slide, .animate-card, .animate-table, .animate-result");
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));

    // Navigation Toggle for Mobile
    window.toggleNav = function() {
        const navMenu = document.getElementById("nav-menu");
        navMenu.classList.toggle("active");
    };
});

// Advanced Subnet Calculator
function calculateSubnet() {
    const input = document.getElementById("subnetInput").value;
    const resultElement = document.getElementById("subnetResult");

    // Validate input
    if (!input.includes("/")) {
        resultElement.innerHTML = "<span style='color: red;'>Invalid format. Use IP/CIDR (e.g., 192.168.1.0/24).</span>";
        return;
    }

    const [ip, cidr] = input.split("/");
    const cidrNum = parseInt(cidr);
    if (isNaN(cidrNum) || cidrNum < 0 || cidrNum > 32) {
        resultElement.innerHTML = "<span style='color: red;'>Invalid CIDR (0-32).</span>";
        return;
    }

    const ipParts = ip.split(".").map(Number);
    if (ipParts.length !== 4 || ipParts.some(part => isNaN(part) || part < 0 || part > 255)) {
        resultElement.innerHTML = "<span style='color: red;'>Invalid IP address.</span>";
        return;
    }

    // Calculate subnet details
    const totalHosts = Math.pow(2, 32 - cidrNum);
    const usableHosts = totalHosts - 2; // Subtract network and broadcast addresses
    
    // Note: The 'numSubnets' calculation here is for how many subnets of this size
    // could theoretically fit within a classful boundary (e.g., /8, /16, /24).
    // For a single subnet calculation, this might be considered redundant output.
    const subnetBits = cidrNum <= 8 ? 8 : cidrNum <= 16 ? 16 : cidrNum <= 24 ? 24 : 32;
    const numSubnets = Math.pow(2, subnetBits - cidrNum); 
    const blockSize = totalHosts; // Represents the size of the subnet block

    // Calculate subnet mask
    // Using >>> 0 to ensure unsigned right shift for proper mask calculation in JavaScript
    const mask = (0xffffffff << (32 - cidrNum)) >>> 0; 
    const maskOctets = [
        (mask >> 24) & 255,
        (mask >> 16) & 255,
        (mask >> 8) & 255,
        mask & 255
    ];

    // Calculate network and broadcast
    const ipNum = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
    const networkNum = ipNum & mask;
    const broadcastNum = networkNum + totalHosts - 1;

    const networkIP = [
        (networkNum >> 24) & 255,
        (networkNum >> 16) & 255,
        (networkNum >> 8) & 255,
        networkNum & 255
    ].join(".");

    const broadcastIP = [
        (broadcastNum >> 24) & 255,
        (broadcastNum >> 16) & 255,
        (broadcastNum >> 8) & 255,
        broadcastNum & 255
    ].join(".");

    // Calculate IP range
    const firstHost = networkNum + 1;
    const lastHost = broadcastNum - 1;

    // Handle cases where usable hosts are 0 (e.g., /31 or /32)
    const rangeStart = usableHosts > 0 ? [
        (firstHost >> 24) & 255,
        (firstHost >> 16) & 255,
        (firstHost >> 8) & 255,
        firstHost & 255
    ].join(".") : "N/A (No usable hosts)";

    const rangeEnd = usableHosts > 0 ? [
        (lastHost >> 24) & 255,
        (lastHost >> 16) & 255,
        (lastHost >> 8) & 255,
        lastHost & 255
    ].join(".") : "N/A (No usable hosts)";

    // Determine IP class
    let ipClass = "";
    let defaultMask = "";
    if (ipParts[0] >= 1 && ipParts[0] <= 126) {
        ipClass = "A";
        defaultMask = "255.0.0.0";
    } else if (ipParts[0] >= 128 && ipParts[0] <= 191) {
        ipClass = "B";
        defaultMask = "255.255.0.0";
    } else if (ipParts[0] >= 192 && ipParts[0] <= 223) {
        ipClass = "C";
        defaultMask = "255.255.255.0";
    } else if (ipParts[0] >= 224 && ipParts[0] <= 239) {
        ipClass = "D (Multicast)";
        defaultMask = "N/A";
    } else {
        ipClass = "E (Reserved)";
        defaultMask = "N/A";
    }

    // Display results
    resultElement.innerHTML = `
        <strong>Subnet Calculation Results:</strong><br>
        IP Class: ${ipClass}<br>
        Default Subnet Mask (Classful): ${defaultMask}<br>
        Custom Subnet Mask: ${maskOctets.join(".")}<br>
        CIDR Notation: /${cidrNum}<br>
        Number of Subnets: ${numSubnets}<br>
        Total Hosts per Subnet: ${totalHosts}<br>
        Usable Hosts: ${usableHosts}<br>
        Block Size: ${blockSize}<br>
        Network IP: ${networkIP}<br>
        Broadcast IP: ${broadcastIP}<br>
        Usable IP Range: ${rangeStart} - ${rangeEnd}
    `;
}