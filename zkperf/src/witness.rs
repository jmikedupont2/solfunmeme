// zkperf/src/witness.rs
// Generate ZK proof from perf + strace recordings

use std::process::Command;

pub struct WitnessData {
    pub perf_cycles: u64,
    pub perf_instructions: u64,
    pub cache_misses: u64,
    pub syscalls: Vec<Syscall>,
    pub result: MonitorResult,
}

pub struct Syscall {
    pub name: String,
    pub duration_us: u64,
    pub args: Vec<String>,
}

pub struct MonitorResult {
    pub http_status: u16,
    pub response_time: f64,
    pub dns_result: String,
}

impl WitnessData {
    pub fn from_recordings(perf_file: &str, strace_file: &str) -> Result<Self> {
        // Parse perf data
        let perf_output = Command::new("perf")
            .args(&["report", "-i", perf_file, "--stdio"])
            .output()?;
        
        let perf = parse_perf(&perf_output.stdout)?;
        
        // Parse strace
        let strace = std::fs::read_to_string(strace_file)?;
        let syscalls = parse_strace(&strace)?;
        
        Ok(WitnessData {
            perf_cycles: perf.cycles,
            perf_instructions: perf.instructions,
            cache_misses: perf.cache_misses,
            syscalls,
            result: MonitorResult::default(),
        })
    }
    
    pub fn generate_proof(&self) -> ZkProof {
        // Prove:
        // 1. Monitoring script executed with expected complexity
        // 2. Syscalls match expected pattern (socket, connect, sendto, recvfrom)
        // 3. Result is authentic (not tampered)
        
        let claim = ComplexityClaim {
            function: "monitor".to_string(),
            max_cycles: 10_000_000,  // Expected for curl + dig
            max_instructions: 5_000_000,
            expected_syscalls: vec!["socket", "connect", "sendto", "recvfrom"],
        };
        
        // Verify actual matches claim
        assert!(self.perf_cycles < claim.max_cycles);
        assert!(self.perf_instructions < claim.max_instructions);
        
        // Generate ZK proof
        prove_complexity_match(&claim, self)
    }
}

fn parse_perf(output: &[u8]) -> Result<PerfData> {
    // Parse perf report output
    // Extract: cycles, instructions, cache-misses
    let text = String::from_utf8_lossy(output);
    
    let cycles = extract_counter(&text, "cycles")?;
    let instructions = extract_counter(&text, "instructions")?;
    let cache_misses = extract_counter(&text, "cache-misses")?;
    
    Ok(PerfData { cycles, instructions, cache_misses })
}

fn parse_strace(log: &str) -> Result<Vec<Syscall>> {
    // Parse strace output
    // Format: 14:56:57.123456 socket(AF_INET, SOCK_STREAM, IPPROTO_TCP) = 3 <0.000123>
    
    log.lines()
        .filter_map(|line| {
            let parts: Vec<_> = line.split_whitespace().collect();
            if parts.len() < 3 { return None; }
            
            let name = parts[1].split('(').next()?.to_string();
            let duration = parts.last()?
                .trim_matches(|c| c == '<' || c == '>')
                .parse::<f64>().ok()?;
            
            Some(Syscall {
                name,
                duration_us: (duration * 1_000_000.0) as u64,
                args: vec![],
            })
        })
        .collect()
}

// CLI command
pub fn witness_command(
    perf_file: &str,
    strace_file: &str,
    result: &str,
    target: &str,
    submit: bool,
) -> Result<()> {
    // Load recordings
    let mut witness = WitnessData::from_recordings(perf_file, strace_file)?;
    
    // Parse result
    let parts: Vec<_> = result.split('|').collect();
    witness.result = MonitorResult {
        http_status: parts[0].parse()?,
        response_time: parts[1].parse()?,
        dns_result: parts[2].to_string(),
    };
    
    // Generate proof
    let proof = witness.generate_proof();
    
    println!("✅ Generated zkPerf witness proof");
    println!("   Cycles: {}", witness.perf_cycles);
    println!("   Instructions: {}", witness.perf_instructions);
    println!("   Syscalls: {}", witness.syscalls.len());
    println!("   HTTP Status: {}", witness.result.http_status);
    println!("   Response Time: {}s", witness.result.response_time);
    
    if submit {
        // Submit to witness network
        submit_witness_proof(&proof, target)?;
        println!("✅ Submitted to witness network");
    }
    
    Ok(())
}

fn submit_witness_proof(proof: &ZkProof, target: &str) -> Result<()> {
    // Submit via zkStego (hidden in HTTP request)
    let client = reqwest::blocking::Client::new();
    let mut req = client.get(target).build()?;
    
    // Encode proof in headers
    zkstego::encode_http_headers(&mut req, proof)?;
    
    let resp = client.execute(req)?;
    
    // Decode consensus from response
    let consensus = zkstego::decode_http_headers(&resp)?;
    
    println!("   Consensus: {} witnesses agree", consensus.witness_count);
    
    Ok(())
}
