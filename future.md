# Future Development: Code Similarity & Quality Analysis System

## Executive Summary

Dokumen ini berisi rekomendasi arsitektur dan alur implementasi untuk sistem **Code Similarity Detection** dan **Code Quality Analysis** pada platform Capstone Project Management. Sistem ini dirancang untuk mendeteksi plagiarisme kode dan memberikan analisis kualitas kode mahasiswa secara otomatis.

---

## 1. Analisis Kebutuhan

### 1.1 Problem Statement
- Dosen penguji perlu mengetahui tingkat **kesamaan kode** antar project mahasiswa
- Diperlukan **analisis kualitas kode** untuk memberikan feedback yang objektif
- Sistem harus **tidak terlalu bergantung** pada satu metode (CodeBERT) saja

### 1.2 Goals
1. Mendeteksi similarity antar project capstone
2. Memberikan score kualitas kode otomatis
3. Menyediakan insight untuk dosen penguji
4. Hybrid approach: kombinasi multiple metode analysis

---

## 2. Arsitektur Sistem yang Direkomendasikan

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CODE ANALYSIS PIPELINE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌─────────────────┐    ┌──────────────────────────┐   │
│  │   GitHub     │───▶│  Code Extractor │───▶│   Analysis Dispatcher    │   │
│  │  Repository  │    │   & Normalizer  │    │                          │   │
│  └──────────────┘    └─────────────────┘    └───────────┬──────────────┘   │
│                                                          │                   │
│                     ┌────────────────────────────────────┼──────────────┐   │
│                     │                                    │              │   │
│                     ▼                                    ▼              ▼   │
│  ┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │  LAYER 1: SYNTACTIC  │  │ LAYER 2: SEMANTIC│  │ LAYER 3: QUALITY │     │
│  │    (Fast Check)      │  │ (Deep Analysis)  │  │   (Code Metrics) │     │
│  ├──────────────────────┤  ├──────────────────┤  ├──────────────────┤     │
│  │ • Token-based (MOSS) │  │ • CodeBERT       │  │ • ESLint/TSLint  │     │
│  │ • Hash Fingerprint   │  │ • GraphCodeBERT  │  │ • Complexity     │     │
│  │ • AST Comparison     │  │ • UniXcoder      │  │ • Maintainability│     │
│  │ • N-gram Analysis    │  │ • Code2Vec       │  │ • Test Coverage  │     │
│  └──────────┬───────────┘  └────────┬─────────┘  └────────┬─────────┘     │
│             │                       │                     │                │
│             └───────────────────────┼─────────────────────┘                │
│                                     ▼                                       │
│                        ┌──────────────────────┐                            │
│                        │   Score Aggregator   │                            │
│                        │  & Weight Calculator │                            │
│                        └──────────┬───────────┘                            │
│                                   │                                         │
│                                   ▼                                         │
│                        ┌──────────────────────┐                            │
│                        │    Result Storage    │                            │
│                        │  (PostgreSQL/Redis)  │                            │
│                        └──────────────────────┘                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Metode Analysis (Multi-Layer Approach)

### 3.1 Layer 1: Syntactic Analysis (Tidak memerlukan ML)

#### 3.1.1 Token-based Similarity (MOSS-like)
- **Deskripsi**: Membandingkan sequence token setelah normalisasi
- **Kelebihan**: Cepat, tidak butuh GPU, well-established
- **Library**: `winnowing` algorithm, custom tokenizer

```typescript
// Contoh pseudocode
interface TokenAnalysis {
  winnowingHash(code: string, k: number, t: number): number[];
  computeSimilarity(hash1: number[], hash2: number[]): number;
}
```

#### 3.1.2 AST-based Comparison
- **Deskripsi**: Parse kode ke AST, bandingkan struktur tree
- **Kelebihan**: Mendeteksi similarity meski variable/function name berubah
- **Library**: `@babel/parser`, `tree-sitter`, `typescript` compiler API

```typescript
// Struktur AST Comparison
interface ASTComparisonResult {
  structuralSimilarity: number;  // 0-100%
  nodeMatchCount: number;
  treeDiff: TreeDiffNode[];
}
```

#### 3.1.3 N-gram Fingerprinting
- **Deskripsi**: Generate fingerprint dari n-gram code tokens
- **Kelebihan**: Sangat cepat untuk filtering awal
- **Complexity**: O(n) untuk generation, O(1) untuk lookup dengan hash

### 3.2 Layer 2: Semantic Analysis (ML-based)

#### 3.2.1 CodeBERT (Primary)
- **Model**: `microsoft/codebert-base`
- **Deskripsi**: Pre-trained model untuk understanding code semantics
- **Use Case**: Mendeteksi similarity kode yang di-refactor/rename

```typescript
interface CodeBERTAnalysis {
  embedCode(code: string): Float32Array;  // 768-dim vector
  cosineSimilarity(vec1: Float32Array, vec2: Float32Array): number;
}
```

#### 3.2.2 GraphCodeBERT (Alternative/Complement)
- **Model**: `microsoft/graphcodebert-base`
- **Deskripsi**: Mempertimbangkan data flow dalam code
- **Advantage**: Lebih baik untuk mendeteksi logical similarity

#### 3.2.3 UniXcoder (Recommended as Fallback)
- **Model**: `microsoft/unixcoder-base`
- **Deskripsi**: Unified cross-modal pre-trained model
- **Advantage**: Support multiple programming languages

#### 3.2.4 Code2Vec (Lightweight Alternative)
- **Deskripsi**: Path-based representation learning
- **Advantage**: Lebih ringan dari BERT-based models
- **Use Case**: Untuk analysis skala besar

### 3.3 Layer 3: Code Quality Analysis

#### 3.3.1 Static Analysis Tools
```typescript
interface QualityMetrics {
  // Linting Scores
  eslintScore: number;           // Error/warning count
  typescriptStrictness: number;  // Type coverage
  
  // Complexity Metrics
  cyclomaticComplexity: number;  // McCabe complexity
  cognitiveComplexity: number;   // Sonar-style complexity
  halsteadMetrics: HalsteadMetrics;
  
  // Maintainability
  maintainabilityIndex: number;  // 0-100 scale
  technicalDebtRatio: number;    // Debt vs total time
  
  // Code Structure
  codeSmells: CodeSmell[];
  duplicateBlocks: DuplicateBlock[];
}
```

#### 3.3.2 Tools yang Direkomendasikan
| Tool | Purpose | Integration |
|------|---------|-------------|
| ESLint | JS/TS linting | NPM package |
| SonarJS | Code smells | Docker/API |
| jscpd | Duplicate detection | NPM package |
| complexity-report | Complexity metrics | NPM package |
| Plato | Maintainability | NPM package |

---

## 4. Alur Implementasi (Implementation Roadmap)

### Phase 1: Foundation (2-3 minggu)

```
Week 1-2: Infrastructure Setup
├── [ ] Setup Python microservice untuk ML analysis
├── [ ] Setup Redis untuk caching analysis results
├── [ ] Create database schema untuk analysis results
├── [ ] Setup job queue (Bull/BullMQ) untuk async processing
└── [ ] Create API endpoints untuk trigger analysis
```

#### 4.1.1 Database Schema Addition (Prisma)

```prisma
// Tambahan untuk schema.prisma

model CodeAnalysis {
  id              String   @id @default(cuid())
  projectId       String
  project         Project  @relation(fields: [projectId], references: [id])
  
  // Overall Scores
  qualityScore    Float    // 0-100
  similarityFlag  Boolean  @default(false)
  
  // Detailed Results
  syntacticResult Json?    // Layer 1 results
  semanticResult  Json?    // Layer 2 results  
  qualityResult   Json?    // Layer 3 results
  
  // Metadata
  analyzedAt      DateTime @default(now())
  analysisVersion String   // Version tracking
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([projectId])
}

model SimilarityReport {
  id              String   @id @default(cuid())
  
  // Project pairs
  sourceProjectId String
  sourceProject   Project  @relation("SourceSimilarity", fields: [sourceProjectId], references: [id])
  targetProjectId String
  targetProject   Project  @relation("TargetSimilarity", fields: [targetProjectId], references: [id])
  
  // Similarity Scores by Method
  tokenSimilarity Float?   // MOSS-like
  astSimilarity   Float?   // AST comparison
  semanticSimilarity Float? // CodeBERT/similar
  
  // Aggregated Score
  overallSimilarity Float  // Weighted average
  confidenceLevel   Float  // How confident the detection is
  
  // Detailed Findings
  similarFiles    Json     // [{file1, file2, similarity}]
  suspiciousBlocks Json?   // Specific code blocks
  
  createdAt       DateTime @default(now())
  
  @@unique([sourceProjectId, targetProjectId])
  @@index([sourceProjectId])
  @@index([targetProjectId])
}
```

#### 4.1.2 API Routes Structure

```
src/app/api/
├── analysis/
│   ├── trigger/
│   │   └── route.ts          # POST: Trigger analysis for a project
│   ├── status/
│   │   └── [projectId]/
│   │       └── route.ts      # GET: Check analysis status
│   ├── results/
│   │   └── [projectId]/
│   │       └── route.ts      # GET: Get analysis results
│   └── similarity/
│       ├── route.ts          # GET: List all similarity reports
│       └── [reportId]/
│           └── route.ts      # GET: Detailed similarity report
└── quality/
    └── [projectId]/
        └── route.ts          # GET: Quality metrics
```

### Phase 2: Syntactic Analysis (2 minggu)

```
Week 3-4: Layer 1 Implementation
├── [ ] Implement code tokenizer & normalizer
├── [ ] Implement Winnowing algorithm for hashing
├── [ ] Integrate AST parser (babel/typescript)
├── [ ] Create AST comparison logic
├── [ ] Implement N-gram fingerprinting
└── [ ] Unit tests untuk semua methods
```

#### 4.2.1 Code Tokenizer Service

```typescript
// src/lib/analysis/tokenizer.ts

export interface TokenizerOptions {
  language: 'typescript' | 'javascript' | 'python';
  removeComments: boolean;
  normalizeIdentifiers: boolean;
  removeWhitespace: boolean;
}

export class CodeTokenizer {
  constructor(private options: TokenizerOptions) {}
  
  tokenize(code: string): Token[] {
    // 1. Remove comments if needed
    // 2. Normalize identifiers (VAR, FUNC, etc.)
    // 3. Generate tokens
    return tokens;
  }
  
  normalize(code: string): string {
    // Normalize untuk comparison
    return normalizedCode;
  }
}
```

#### 4.2.2 Winnowing Algorithm Implementation

```typescript
// src/lib/analysis/winnowing.ts

export class WinnowingFingerprint {
  constructor(
    private k: number = 5,  // k-gram size
    private w: number = 4   // window size
  ) {}
  
  generateFingerprint(tokens: Token[]): number[] {
    // 1. Generate k-grams
    // 2. Hash each k-gram
    // 3. Select minimum from each window
    return fingerprint;
  }
  
  compare(fp1: number[], fp2: number[]): number {
    // Jaccard similarity
    const intersection = this.intersect(fp1, fp2);
    const union = this.union(fp1, fp2);
    return intersection.length / union.length;
  }
}
```

### Phase 3: Semantic Analysis Service (3 minggu)

```
Week 5-7: Layer 2 Implementation
├── [ ] Setup Python FastAPI service
├── [ ] Integrate CodeBERT model
├── [ ] Integrate fallback models (UniXcoder/Code2Vec)
├── [ ] Create embedding storage (PostgreSQL/Pinecone)
├── [ ] Implement batch processing
└── [ ] Create REST API for Node.js communication
```

#### 4.3.1 Python Service Structure

```
analysis-service/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── models/
│   │   ├── codebert.py      # CodeBERT wrapper
│   │   ├── unixcoder.py     # UniXcoder wrapper
│   │   └── code2vec.py      # Code2Vec wrapper
│   ├── services/
│   │   ├── embedder.py      # Code embedding service
│   │   ├── similarity.py    # Similarity computation
│   │   └── quality.py       # Quality analysis
│   └── api/
│       ├── routes.py        # API routes
│       └── schemas.py       # Pydantic schemas
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

#### 4.3.2 Python Service API

```python
# app/main.py

from fastapi import FastAPI
from transformers import AutoModel, AutoTokenizer
import torch

app = FastAPI()

class CodeEmbedder:
    def __init__(self, model_name="microsoft/codebert-base"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)
    
    def embed(self, code: str) -> list[float]:
        inputs = self.tokenizer(code, return_tensors="pt", 
                                max_length=512, truncation=True)
        with torch.no_grad():
            outputs = self.model(**inputs)
        # Use [CLS] token embedding
        return outputs.last_hidden_state[:, 0, :].squeeze().tolist()

@app.post("/embed")
async def embed_code(request: EmbedRequest):
    embedding = embedder.embed(request.code)
    return {"embedding": embedding}

@app.post("/similarity")
async def compute_similarity(request: SimilarityRequest):
    emb1 = embedder.embed(request.code1)
    emb2 = embedder.embed(request.code2)
    similarity = cosine_similarity(emb1, emb2)
    return {"similarity": similarity}
```

### Phase 4: Quality Analysis (2 minggu)

```
Week 8-9: Layer 3 Implementation
├── [ ] Integrate ESLint programmatically
├── [ ] Implement complexity metrics (cyclomatic, cognitive)
├── [ ] Create maintainability index calculator
├── [ ] Integrate jscpd for duplicate detection
├── [ ] Create aggregated quality score
└── [ ] Build quality report generator
```

#### 4.4.1 Quality Analyzer Service

```typescript
// src/lib/analysis/quality-analyzer.ts

import { ESLint } from 'eslint';
import { calculateComplexity } from './complexity';
import { detectDuplicates } from './duplicates';

export class QualityAnalyzer {
  private eslint: ESLint;
  
  async analyze(files: CodeFile[]): Promise<QualityReport> {
    // 1. Run ESLint
    const lintResults = await this.runEslint(files);
    
    // 2. Calculate complexity
    const complexityResults = await this.calculateComplexity(files);
    
    // 3. Detect duplicates
    const duplicates = await this.detectDuplicates(files);
    
    // 4. Calculate maintainability index
    const maintainability = this.calculateMaintainability(
      complexityResults,
      lintResults
    );
    
    // 5. Aggregate score
    return {
      overallScore: this.aggregateScore({
        lintResults,
        complexityResults,
        duplicates,
        maintainability
      }),
      details: {
        linting: lintResults,
        complexity: complexityResults,
        duplicates: duplicates,
        maintainability: maintainability
      }
    };
  }
  
  private aggregateScore(metrics: AllMetrics): number {
    // Weighted scoring
    const weights = {
      linting: 0.25,
      complexity: 0.25,
      duplicates: 0.20,
      maintainability: 0.30
    };
    
    return (
      metrics.lintResults.score * weights.linting +
      metrics.complexityResults.score * weights.complexity +
      metrics.duplicates.score * weights.duplicates +
      metrics.maintainability.score * weights.maintainability
    );
  }
}
```

### Phase 5: Integration & UI (2-3 minggu)

```
Week 10-12: Frontend & Integration
├── [ ] Create analysis dashboard component
├── [ ] Build similarity comparison view
├── [ ] Create quality metrics visualization
├── [ ] Implement real-time analysis status
├── [ ] Add analysis to review workflow
└── [ ] Admin configuration panel
```

#### 4.5.1 Frontend Components Structure

```
src/components/analysis/
├── AnalysisDashboard.tsx        # Main dashboard
├── SimilarityMatrix.tsx         # Heatmap of similarities
├── SimilarityDetail.tsx         # Detailed comparison view
├── QualityOverview.tsx          # Quality score overview
├── QualityMetrics.tsx           # Detailed metrics
├── CodeDiff.tsx                 # Side-by-side code comparison
├── AnalysisProgress.tsx         # Analysis progress indicator
└── charts/
    ├── ComplexityChart.tsx      # Complexity visualization
    ├── CoverageChart.tsx        # Coverage metrics
    └── TrendChart.tsx           # Historical trends
```

---

## 5. Scoring & Weighting System

### 5.1 Similarity Score Calculation

```typescript
interface SimilarityWeights {
  // Layer 1: Syntactic (40% total)
  tokenBased: 0.15,      // MOSS-like
  astBased: 0.15,        // Structure comparison
  ngramBased: 0.10,      // Quick fingerprint
  
  // Layer 2: Semantic (60% total)
  codeBert: 0.35,        // Primary semantic
  fallbackModel: 0.25,   // UniXcoder/Code2Vec
}

function calculateFinalSimilarity(results: AnalysisResults): number {
  const weights = getSimilarityWeights();
  
  let score = 0;
  let totalWeight = 0;
  
  // Only include available results
  if (results.tokenSimilarity !== null) {
    score += results.tokenSimilarity * weights.tokenBased;
    totalWeight += weights.tokenBased;
  }
  
  // ... similar for other methods
  
  return score / totalWeight;
}
```

### 5.2 Quality Score Calculation

```typescript
interface QualityScoring {
  // Linting (25%)
  lintScore: {
    weight: 0.25,
    calculation: '100 - (errors * 5 + warnings * 1)',
    max: 100,
    min: 0
  },
  
  // Complexity (25%)
  complexityScore: {
    weight: 0.25,
    // Based on average cyclomatic complexity
    calculation: 'max(0, 100 - (avgComplexity - 10) * 5)',
    thresholds: {
      excellent: '<10',
      good: '10-20',
      moderate: '20-30',
      poor: '>30'
    }
  },
  
  // Duplication (20%)
  duplicationScore: {
    weight: 0.20,
    calculation: '100 - duplicatePercentage',
    thresholds: {
      excellent: '<3%',
      good: '3-5%',
      moderate: '5-10%',
      poor: '>10%'
    }
  },
  
  // Maintainability (30%)
  maintainabilityScore: {
    weight: 0.30,
    // Based on Maintainability Index
    thresholds: {
      excellent: '>85',
      good: '65-85',
      moderate: '40-65',
      poor: '<40'
    }
  }
}
```

### 5.3 Threshold Configuration

```typescript
// Admin configurable thresholds
interface AnalysisThresholds {
  similarity: {
    low: 0.30,       // < 30% = No concern
    medium: 0.50,    // 30-50% = Review needed
    high: 0.70,      // 50-70% = Suspicious
    critical: 0.85   // > 85% = Likely plagiarism
  },
  
  quality: {
    poor: 40,
    fair: 60,
    good: 75,
    excellent: 90
  }
}
```

---

## 6. Fallback Strategy (Mengurangi Ketergantungan pada CodeBERT)

### 6.1 Fallback Hierarchy

```
Primary Analysis Path:
┌─────────────────────────────────────────────────────────────────────┐
│  1. CodeBERT Available? ───Yes──▶ Use CodeBERT (semantic)          │
│         │                                                           │
│        No                                                           │
│         ▼                                                           │
│  2. UniXcoder Available? ───Yes──▶ Use UniXcoder                   │
│         │                                                           │
│        No                                                           │
│         ▼                                                           │
│  3. Code2Vec Available? ───Yes──▶ Use Code2Vec                     │
│         │                                                           │
│        No                                                           │
│         ▼                                                           │
│  4. Fallback to Syntactic-Only Mode                                │
│     (AST + Token + N-gram analysis)                                │
│     - Increase weight for syntactic methods                        │
│     - Lower confidence score                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Hybrid Scoring When ML Unavailable

```typescript
// Ketika model ML tidak tersedia
const syntacticOnlyWeights: SimilarityWeights = {
  tokenBased: 0.35,    // Increased from 0.15
  astBased: 0.40,      // Increased from 0.15
  ngramBased: 0.25,    // Increased from 0.10
  codeBert: 0,         // Disabled
  fallbackModel: 0     // Disabled
};

function getWeights(mlAvailable: boolean): SimilarityWeights {
  if (mlAvailable) {
    return defaultWeights;
  }
  return syntacticOnlyWeights;
}
```

### 6.3 Confidence Score Adjustment

```typescript
interface AnalysisResult {
  similarity: number;
  confidence: number;  // How confident we are in the result
  methodsUsed: string[];
}

function calculateConfidence(methodsUsed: string[]): number {
  let confidence = 0.5;  // Base confidence
  
  // Add confidence for each method used
  if (methodsUsed.includes('codebert')) confidence += 0.25;
  if (methodsUsed.includes('ast')) confidence += 0.15;
  if (methodsUsed.includes('token')) confidence += 0.10;
  
  return Math.min(confidence, 1.0);
}
```

---

## 7. Technical Stack Recommendations

### 7.1 Tech Stack Summary

| Component | Recommended | Alternative |
|-----------|-------------|-------------|
| **Job Queue** | BullMQ | Agenda.js |
| **ML Service** | Python FastAPI | Python Flask |
| **ML Framework** | PyTorch + Transformers | TensorFlow |
| **Caching** | Redis | PostgreSQL |
| **Vector DB** | pgvector (PostgreSQL) | Pinecone, Milvus |
| **AST Parser** | @babel/parser | tree-sitter |
| **Linting** | ESLint | Biome |
| **Duplicate Detection** | jscpd | custom winnowing |

### 7.2 Infrastructure Requirements

```yaml
# Minimum requirements untuk ML service
ml-service:
  cpu: 4 cores
  memory: 8GB (16GB recommended)
  gpu: Optional (NVIDIA with CUDA for faster inference)
  storage: 10GB (for model weights)

# Main application
web-service:
  cpu: 2 cores
  memory: 4GB
  
# Redis (caching & job queue)
redis:
  memory: 2GB
  
# PostgreSQL
database:
  storage: 20GB+ (depending on projects)
```

### 7.3 Docker Compose Setup

```yaml
# docker-compose.analysis.yml
version: '3.8'

services:
  analysis-service:
    build: ./analysis-service
    ports:
      - "8000:8000"
    environment:
      - MODEL_NAME=microsoft/codebert-base
      - FALLBACK_MODEL=microsoft/unixcoder-base
    volumes:
      - model-cache:/root/.cache/huggingface
    deploy:
      resources:
        limits:
          memory: 8G
        reservations:
          memory: 4G
          
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  model-cache:
  redis-data:
```

---

## 8. API Design

### 8.1 Analysis Trigger API

```typescript
// POST /api/analysis/trigger
interface TriggerAnalysisRequest {
  projectId: string;
  analysisType: 'full' | 'similarity_only' | 'quality_only';
  compareWith?: string[];  // Project IDs to compare against
  options?: {
    useSemanticAnalysis: boolean;
    skipCache: boolean;
  };
}

interface TriggerAnalysisResponse {
  jobId: string;
  status: 'queued' | 'processing';
  estimatedTime: number;  // seconds
}
```

### 8.2 Analysis Results API

```typescript
// GET /api/analysis/results/{projectId}
interface AnalysisResultsResponse {
  projectId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  completedAt?: string;
  
  quality?: {
    overallScore: number;
    linting: LintingResult;
    complexity: ComplexityResult;
    duplicates: DuplicatesResult;
    maintainability: MaintainabilityResult;
  };
  
  similarity?: {
    highestMatch: {
      projectId: string;
      projectTitle: string;
      score: number;
    };
    allMatches: SimilarityMatch[];
  };
  
  methodsUsed: string[];
  confidence: number;
}
```

### 8.3 Similarity Report API

```typescript
// GET /api/analysis/similarity/{reportId}
interface SimilarityReportResponse {
  id: string;
  sourceProject: ProjectSummary;
  targetProject: ProjectSummary;
  
  scores: {
    overall: number;
    byMethod: {
      token: number;
      ast: number;
      semantic: number;
    };
  };
  
  suspiciousFiles: Array<{
    sourceFile: string;
    targetFile: string;
    similarity: number;
    suspiciousBlocks: Array<{
      sourceLines: [number, number];
      targetLines: [number, number];
      code: string;
    }>;
  }>;
  
  verdict: 'clean' | 'review_needed' | 'suspicious' | 'likely_plagiarism';
  confidence: number;
}
```

---

## 9. Security Considerations

### 9.1 Data Privacy
- Code hanya diproses, tidak disimpan raw di analysis service
- Embeddings dapat disimpan untuk comparison cepat
- Clear retention policy untuk analysis results

### 9.2 Resource Protection
```typescript
// Rate limiting untuk analysis
const analysisLimits = {
  perProject: {
    maxPerHour: 3,
    maxPerDay: 10
  },
  perUser: {
    maxConcurrent: 2,
    maxPerDay: 20
  }
};
```

### 9.3 Input Validation
- Maximum file size: 1MB per file
- Maximum files per analysis: 500
- Supported languages only
- Sanitize file paths

---

## 10. Monitoring & Observability

### 10.1 Metrics to Track

```typescript
interface AnalysisMetrics {
  // Performance
  averageAnalysisTime: number;
  queueDepth: number;
  processingRate: number;
  
  // Quality
  mlServiceAvailability: number;
  fallbackUsageRate: number;
  
  // Business
  totalAnalysesRun: number;
  suspiciousCasesFound: number;
  averageQualityScore: number;
}
```

### 10.2 Alerting

```yaml
alerts:
  - name: ml_service_down
    condition: mlServiceAvailability < 0.9
    severity: warning
    
  - name: high_queue_depth
    condition: queueDepth > 100
    severity: warning
    
  - name: analysis_failure_rate
    condition: failureRate > 0.1
    severity: critical
```

---

## 11. Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1** | 2-3 weeks | Infrastructure, DB schema, Job queue |
| **Phase 2** | 2 weeks | Syntactic analysis (Token, AST, N-gram) |
| **Phase 3** | 3 weeks | Semantic analysis (CodeBERT + fallbacks) |
| **Phase 4** | 2 weeks | Quality analysis (ESLint, Complexity) |
| **Phase 5** | 2-3 weeks | UI integration, Dashboard |
| **Total** | **11-13 weeks** | Full feature implementation |

---

## 12. Future Enhancements

### 12.1 Phase 2 Features (Post-MVP)
- [ ] Cross-semester comparison (compare with historical projects)
- [ ] Language-specific analysis (Python, Java, etc.)
- [ ] Real-time collaboration detection
- [ ] Integration with external plagiarism services (Turnitin, etc.)

### 12.2 Advanced ML Features
- [ ] Fine-tuned model on Indonesian student code
- [ ] Code style similarity (beyond structural)
- [ ] Automated code review suggestions
- [ ] Learning from lecturer feedback

### 12.3 Reporting & Analytics
- [ ] Department-wide analytics dashboard
- [ ] Trend analysis across semesters
- [ ] Automated report generation for committees
- [ ] Export to academic integrity systems

---

## 13. References & Resources

### 13.1 Papers
- [CodeBERT: A Pre-Trained Model for Programming and Natural Languages](https://arxiv.org/abs/2002.08155)
- [GraphCodeBERT: Pre-training Code Representations with Data Flow](https://arxiv.org/abs/2009.08366)
- [UniXcoder: Unified Cross-Modal Pre-training for Code Representation](https://arxiv.org/abs/2203.03850)

### 13.2 Tools & Libraries
- [Transformers (Hugging Face)](https://huggingface.co/docs/transformers)
- [ESLint](https://eslint.org/)
- [jscpd](https://github.com/kucherenko/jscpd)
- [BullMQ](https://docs.bullmq.io/)

### 13.3 Similar Projects
- [MOSS (Stanford)](https://theory.stanford.edu/~aiken/moss/)
- [JPlag](https://github.com/jplag/JPlag)
- [Codequiry](https://codequiry.com/)

---

*Document Version: 1.0*
*Last Updated: January 2026*
*Author: AI Assistant*
