/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import { DocumentSyntax, BlockSyntax, BaseSyntaxNode, VersionSyntax, PropertySyntax } from "../parsing/syntax-nodes";
import { filterUndefined } from "../util/array-utils";

export enum BoundKind {
  // Top level
  Document,
  Version,
  Workflow,
  Action,

  // Properties
  On,
  Resolves,
  Uses,
  Needs,
  Runs,
  Args,
  Env,
  Secrets,
}

export abstract class BaseBoundNode<TSyntax extends BaseSyntaxNode> {
  protected constructor(public readonly kind: BoundKind, public readonly syntax: TSyntax) {}

  public abstract get children(): ReadonlyArray<BaseBoundNode<BaseSyntaxNode>>;
}

export class BoundDocument extends BaseBoundNode<DocumentSyntax> {
  public constructor(
    public readonly version: BoundVersion | undefined,
    public readonly workflows: ReadonlyArray<BoundWorkflow>,
    public readonly actions: ReadonlyArray<BoundAction>,
    syntax: DocumentSyntax,
  ) {
    super(BoundKind.Document, syntax);
  }

  public get children(): ReadonlyArray<BaseBoundNode<BaseSyntaxNode>> {
    return filterUndefined<BaseBoundNode<BaseSyntaxNode>>(this.version, ...this.workflows, ...this.actions);
  }
}

export class BoundVersion extends BaseBoundNode<VersionSyntax> {
  public constructor(public readonly version: number, syntax: VersionSyntax) {
    super(BoundKind.Version, syntax);
  }

  public get children(): ReadonlyArray<BaseBoundNode<BaseSyntaxNode>> {
    return [];
  }
}

export class BoundWorkflow extends BaseBoundNode<BlockSyntax> {
  public constructor(
    public readonly name: string,
    public readonly on: BoundOn | undefined,
    public readonly resolves: BoundResolves | undefined,
    syntax: BlockSyntax,
  ) {
    super(BoundKind.Workflow, syntax);
  }

  public get children(): ReadonlyArray<BaseBoundNode<BaseSyntaxNode>> {
    return filterUndefined<BaseBoundNode<BaseSyntaxNode>>(this.on, this.resolves);
  }
}

export class BoundAction extends BaseBoundNode<BlockSyntax> {
  public constructor(
    public readonly name: string,
    public readonly uses: BoundUses | undefined,
    public readonly needs: BoundNeeds | undefined,
    public readonly runs: BoundRuns | undefined,
    public readonly args: BoundArgs | undefined,
    public readonly env: BoundEnv | undefined,
    public readonly secrets: BoundSecrets | undefined,
    syntax: BlockSyntax,
  ) {
    super(BoundKind.Action, syntax);
  }

  public get children(): ReadonlyArray<BaseBoundNode<BaseSyntaxNode>> {
    return filterUndefined<BaseBoundNode<BaseSyntaxNode>>(
      this.uses,
      this.needs,
      this.runs,
      this.args,
      this.env,
      this.secrets,
    );
  }
}

export class BoundOn extends BaseBoundNode<PropertySyntax> {
  public constructor(public readonly event: string, syntax: PropertySyntax) {
    super(BoundKind.On, syntax);
  }

  public get children(): ReadonlyArray<BaseBoundNode<BaseSyntaxNode>> {
    return [];
  }
}

export class BoundResolves extends BaseBoundNode<PropertySyntax> {
  public constructor(public readonly actions: ReadonlyArray<string>, syntax: PropertySyntax) {
    super(BoundKind.Resolves, syntax);
  }

  public get children(): ReadonlyArray<BaseBoundNode<BaseSyntaxNode>> {
    return [];
  }
}

export class BoundUses extends BaseBoundNode<PropertySyntax> {
  public constructor(public readonly value: string, syntax: PropertySyntax) {
    super(BoundKind.Uses, syntax);
  }

  public get children(): ReadonlyArray<BaseBoundNode<BaseSyntaxNode>> {
    return [];
  }
}

export class BoundNeeds extends BaseBoundNode<PropertySyntax> {
  public constructor(public readonly actions: ReadonlyArray<string>, syntax: PropertySyntax) {
    super(BoundKind.Needs, syntax);
  }

  public get children(): ReadonlyArray<BaseBoundNode<BaseSyntaxNode>> {
    return [];
  }
}

export class BoundRuns extends BaseBoundNode<PropertySyntax> {
  public constructor(public readonly commands: ReadonlyArray<string>, syntax: PropertySyntax) {
    super(BoundKind.Runs, syntax);
  }

  public get children(): ReadonlyArray<BaseBoundNode<BaseSyntaxNode>> {
    return [];
  }
}

export class BoundArgs extends BaseBoundNode<PropertySyntax> {
  public constructor(public readonly args: ReadonlyArray<string>, syntax: PropertySyntax) {
    super(BoundKind.Args, syntax);
  }

  public get children(): ReadonlyArray<BaseBoundNode<BaseSyntaxNode>> {
    return [];
  }
}

export class BoundEnv extends BaseBoundNode<PropertySyntax> {
  public constructor(public readonly variables: ReadonlyMap<string, string>, syntax: PropertySyntax) {
    super(BoundKind.Env, syntax);
  }

  public get children(): ReadonlyArray<BaseBoundNode<BaseSyntaxNode>> {
    return [];
  }
}

export class BoundSecrets extends BaseBoundNode<PropertySyntax> {
  public constructor(public readonly args: ReadonlyArray<string>, syntax: PropertySyntax) {
    super(BoundKind.Secrets, syntax);
  }

  public get children(): ReadonlyArray<BaseBoundNode<BaseSyntaxNode>> {
    return [];
  }
}
