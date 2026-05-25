import { Project, SyntaxKind, ClassDeclaration } from 'ts-morph';
import * as path from 'path';

export interface PropertyAnalysis {
  name: string;
  type: 'signal' | 'input' | 'computed' | 'standard';
  initializerText?: string;
}

export interface MethodAnalysis {
  name: string;
  statements: string[];
  manualAssignments: string[]; // Properties that are assigned to inside this method
}

export interface ImportAnalysis {
  moduleSpecifier: string;
  namedImports: string[];
}

export interface AnalysisResult {
  filePath: string;
  properties: PropertyAnalysis[];
  methods: MethodAnalysis[];
  imports: ImportAnalysis[];
}

// Global project instance to reuse TS compiler state
let projectInstance: Project | null = null;

function getProject(): Project {
  if (!projectInstance) {
    projectInstance = new Project({
      compilerOptions: {
        target: 99, // ESNext
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      }
    });
  }
  return projectInstance;
}

export function analyzeFile(filePath: string): AnalysisResult {
  const project = getProject();
  
  // Resolve absolute path to ensure consistency
  const absolutePath = path.resolve(filePath);
  
  // If the file is already in the project, reload it from disk to get latest changes
  let sourceFile = project.getSourceFile(absolutePath);
  if (sourceFile) {
    sourceFile.refreshFromFileSystemSync();
  } else {
    sourceFile = project.addSourceFileAtPath(absolutePath);
  }

  const result: AnalysisResult = {
    filePath: absolutePath,
    properties: [],
    methods: [],
    imports: []
  };

  // 1. Analyze Imports
  sourceFile.getImportDeclarations().forEach(imp => {
    const namedImports = imp.getNamedImports().map(ni => ni.getName());
    result.imports.push({
      moduleSpecifier: imp.getModuleSpecifierValue(),
      namedImports
    });
  });

  // 2. Find the primary class in the file
  const classDecl = sourceFile.getFirstDescendantByKind(SyntaxKind.ClassDeclaration);
  if (classDecl) {
    analyzeClass(classDecl, result);
  }

  return result;
}

function analyzeClass(classDecl: ClassDeclaration, result: AnalysisResult) {
  // Analyze Class Properties
  classDecl.getProperties().forEach(prop => {
    const name = prop.getName();
    const initializer = prop.getInitializer();
    let type: PropertyAnalysis['type'] = 'standard';
    let initializerText = initializer?.getText();

    if (initializer && initializer.getKind() === SyntaxKind.CallExpression) {
      const callExpr = initializer.asKindOrThrow(SyntaxKind.CallExpression);
      const callText = callExpr.getExpression().getText();

      if (callText === 'signal') {
        type = 'signal';
      } else if (callText === 'input') {
        type = 'input';
      } else if (callText === 'computed') {
        type = 'computed';
      }
    }

    result.properties.push({
      name,
      type,
      initializerText
    });
  });

  // Analyze Class Methods
  classDecl.getMethods().forEach(method => {
    const name = method.getName();
    const statements: string[] = [];
    const manualAssignments: string[] = [];

    // Traverse all descendants in the method body to find property assignments
    method.getDescendantsOfKind(SyntaxKind.BinaryExpression).forEach(binExpr => {
      const operator = binExpr.getOperatorToken().getKind();
      // Look for assignment operators (=, +=, -=, etc.)
      const isAssignment = 
        operator === SyntaxKind.EqualsToken ||
        operator === SyntaxKind.PlusEqualsToken ||
        operator === SyntaxKind.MinusEqualsToken;

      if (isAssignment) {
        const left = binExpr.getLeft();
        // Check if it's an assignment to this.propertyName or just propertyName
        if (left.getKind() === SyntaxKind.PropertyAccessExpression) {
          const propAccess = left.asKindOrThrow(SyntaxKind.PropertyAccessExpression);
          if (propAccess.getExpression().getText() === 'this') {
            manualAssignments.push(propAccess.getName());
          }
        }
      }
    });

    method.getStatements().forEach(stmt => {
      statements.push(stmt.getText());
    });

    result.methods.push({
      name,
      statements,
      manualAssignments: Array.from(new Set(manualAssignments)) // deduplicate
    });
  });
}
