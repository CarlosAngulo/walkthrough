// Conceptual mapper for Angular signals and components
export interface AngularComponentMetadata {
  selector?: string;
  standalone?: boolean;
  changeDetection?: 'OnPush' | 'Default';
}

export function parseAngularMetadata(metadataText: string): AngularComponentMetadata {
  const result: AngularComponentMetadata = {};
  
  if (metadataText.includes("selector:")) {
    const match = metadataText.match(/selector:\s*['"`]([^'"`]+)['"`]/);
    if (match) result.selector = match[1];
  }
  
  if (metadataText.includes("standalone:")) {
    result.standalone = metadataText.includes("standalone: true");
  }
  
  if (metadataText.includes("changeDetection:")) {
    result.changeDetection = metadataText.includes("OnPush") ? 'OnPush' : 'Default';
  }

  return result;
}
