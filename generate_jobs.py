import random

# ----------------------------------------
# 1️⃣ Course Metadata
# ----------------------------------------
course_types = [
    "Short Course", "Certificate Program", "Diploma",
    "Bachelors Degree", "Masters Degree", "Doctorate"
]
experience_levels = ["Beginner", "Intermediate", "Advanced", "Expert"]
modes = ["Self-Paced", "Instructor-Led", "Hybrid"]
budgets = ["Free", "Under 5000", "5000 - 20000", "20000 - 50000", "50000+"]
durations = ["Less than 1 month", "1-3 months", "3-6 months", "6+ months"]
providers = [
    "TechAcademy", "SkillForge", "CodeLabs", "NextGen IT Institute",
    "InnovateX", "BitMasters", "ProTech Academy", "DigitalNest"
]

# ----------------------------------------
# 2️⃣ Technological & IT Domains (No AI/ML/Data)
# ----------------------------------------
tech_it_domains = [
    ("Computer Hardware Engineering", ["Motherboards", "Chipsets", "BIOS", "Processors", "Hardware Troubleshooting"]),
    ("Embedded Software Design", ["Firmware", "C Programming", "RTOS", "ARM Cortex", "Peripheral Integration"]),
    ("Networking Fundamentals", ["LAN", "WAN", "Routing", "Switching", "Network Topologies"]),
    ("Wireless Network Engineering", ["Wi-Fi", "RF Design", "Antennas", "IoT Connectivity", "Network Security"]),
    ("Telecommunication Systems", ["Signal Processing", "Modulation", "Fiber Optics", "Network Standards", "Transmission"]),
    ("Electronics & Circuit Design", ["Semiconductors", "PCB Layout", "Analog Circuits", "Microcontrollers", "Sensors"]),
    ("Automation & Control Systems", ["PLC Programming", "Industrial Automation", "SCADA", "Sensors", "Control Logic"]),
    ("Robotic Process Automation (RPA)", ["UiPath", "Automation Anywhere", "Workflows", "Scripting", "APIs"]),
    ("Augmented Reality Systems", ["3D Modeling", "Unity", "ARCore", "XR Interfaces", "Sensor Fusion"]),
    ("Virtual Reality Design", ["3D Worlds", "Simulation", "Oculus SDK", "VR Development", "Unity"]),
    ("Human Computer Interaction", ["UX Design", "Interface Testing", "Interaction Models", "User Experience", "Prototyping"]),
    ("Digital Systems Design", ["Boolean Logic", "VHDL", "Verilog", "FPGA", "System Integration"]),
    ("System Administration", ["Linux", "Shell Scripting", "System Configuration", "User Management", "Security Policies"]),
    ("Cloud Infrastructure Management", ["Virtual Machines", "Load Balancing", "Kubernetes", "Storage Systems", "Cloud Backup"]),
    ("Network Security Engineering", ["Firewalls", "Intrusion Detection", "Encryption", "VPNs", "Access Control"]),
    ("Operating Systems Engineering", ["Kernel Design", "Threads", "Memory Management", "File Systems", "Process Scheduling"]),
    ("Quantum Hardware Design", ["Quantum Circuits", "Cryogenic Systems", "Qubits", "Quantum Error Correction", "Superconductivity"]),
    ("High Performance Computing Systems", ["GPU Optimization", "Parallel Algorithms", "MPI", "Cluster Management", "Compute Nodes"]),
    ("Systems Integration Engineering", ["Hardware-Software Interface", "Testing", "Validation", "API Integration", "Performance Tuning"]),
    ("Digital Signal Processing", ["FFT", "Filter Design", "Audio Processing", "DSP Chips", "Noise Reduction"]),
    ("Microprocessor Design", ["Assembly", "CPU Architecture", "Registers", "ALU Design", "Memory Hierarchy"]),
    ("IoT Hardware Systems", ["Sensors", "Microcontrollers", "Wireless Protocols", "IoT Security", "Edge Devices"]),
    ("Semiconductor Technology", ["Wafer Fabrication", "Transistors", "Lithography", "Chip Packaging", "Yield Analysis"]),
    ("Hardware Prototyping", ["3D Printing", "PCB Assembly", "CAD Tools", "Circuit Simulation", "Testing"]),
    ("Server Administration", ["Virtualization", "Storage Management", "Security Hardening", "Load Balancing", "Maintenance"]),
    ("Network Performance Optimization", ["QoS", "Latency Reduction", "Bandwidth Control", "Monitoring", "Scaling"]),
    ("Data Center Management", ["Cooling Systems", "Power Redundancy", "Networking", "Virtualization", "Monitoring"]),
    ("Edge Computing Infrastructure", ["Low Latency Design", "Edge Nodes", "Data Synchronization", "IoT Integration", "Containers"]),
    ("Operating System Security", ["Patch Management", "Access Control", "SELinux", "File Encryption", "Threat Detection"]),
    ("Hardware Security", ["TPM", "Firmware Security", "Secure Boot", "Cryptographic Chips", "Vulnerability Analysis"])
]

specializations = [
    "Bootcamp", "Masterclass", "Advanced Program", "Professional Certificate",
    "Industry Projects", "Applied Course", "Career Track", "Hands-on Lab Series",
    "with IoT Applications", "Job-Ready Training", "System Design Workshop"
]

# ----------------------------------------
# 3️⃣ SQL Setup
# ----------------------------------------
sql_lines = [
    "SET SQL_SAFE_UPDATES = 0;",
    "TRUNCATE TABLE myapp_courses;",
    "SET SQL_SAFE_UPDATES = 1;",
    ""
]

# ----------------------------------------
# 4️⃣ Generate 200 Unique Courses
# ----------------------------------------
used_titles = set()
count = 0

while count < 200:
    base_domain, skills_list = random.choice(tech_it_domains)
    suffix = random.choice(specializations)
    course_type = random.choice(course_types)
    level = random.choice(experience_levels)
    mode = random.choice(modes)
    budget = random.choice(budgets)
    duration = random.choice(durations)
    provider = random.choice(providers)
    rating = round(random.uniform(3.8, 5.0), 2)

    title = f"{base_domain} {suffix} ({level})"
    if title in used_titles:
        continue
    used_titles.add(title)

    skills = ", ".join(skills_list)
    topics = ", ".join(random.sample(skills_list, min(3, len(skills_list))))

    description = (
        f"The {course_type.lower()} '{title}' offers a complete learning experience in {base_domain.lower()}. "
        f"Designed for {level.lower()} professionals, it emphasizes hands-on projects and in-depth understanding of "
        f"{topics}. Students gain exposure to real-world hardware and IT challenges while learning from industry experts "
        f"at {provider}. This course helps build core technical expertise essential for success in modern technology environments."
    )

    safe_description = description.replace("'", "''")
    safe_title = title.replace("'", "''")

    sql = f"""
INSERT INTO myapp_courses
(interest, course_type, experience_level, mode, budget, duration, suggested_course, description, skills, topics, provider, rating)
VALUES (
'Technological & IT',
'{course_type}',
'{level}',
'{mode}',
'{budget}',
'{duration}',
'{safe_title}',
'{safe_description}',
'{skills}',
'{topics}',
'{provider}',
{rating}
);
"""
    sql_lines.append(sql.strip())
    count += 1

# ----------------------------------------
# 5️⃣ Write SQL File
# ----------------------------------------
with open("technological_it_courses_200.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(sql_lines))

print(f"✅ technological_it_courses_200.sql generated successfully with {count} unique entries.")
