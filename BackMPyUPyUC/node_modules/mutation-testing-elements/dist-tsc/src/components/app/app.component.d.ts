import type { PropertyValues } from 'lit';
import type { MutationTestResult } from 'mutation-testing-report-schema/api';
import type { MetricsResult } from 'mutation-testing-metrics';
import { View } from '../../lib/router.js';
import type { Subscription } from 'rxjs';
import type { FileUnderTestModel, Metrics, MutationTestMetricsResult, TestFileModel, TestMetrics } from 'mutation-testing-metrics';
import { RealTimeElement } from '../real-time-element.js';
interface BaseContext {
    path: string[];
}
interface MutantContext extends BaseContext {
    view: View.mutant;
    result?: MetricsResult<FileUnderTestModel, Metrics>;
}
interface TestContext extends BaseContext {
    view: View.test;
    result?: MetricsResult<TestFileModel, TestMetrics>;
}
type Context = MutantContext | TestContext;
export declare class MutationTestReportAppComponent extends RealTimeElement {
    report: MutationTestResult | undefined;
    rootModel: MutationTestMetricsResult | undefined;
    src: string | undefined;
    sse: string | undefined;
    errorMessage: string | undefined;
    context: Context;
    path: readonly string[];
    titlePostfix: string | undefined;
    theme?: string;
    get themeBackgroundColor(): string;
    get title(): string;
    constructor();
    firstUpdated(): void;
    private loadData;
    willUpdate(changedProperties: PropertyValues): Promise<void>;
    private mutants;
    private tests;
    updated(changedProperties: PropertyValues): void;
    private getTheme;
    private updateModel;
    private updateContext;
    private updateTitle;
    themeSwitch: (event: CustomEvent<string>) => void;
    static styles: import("lit").CSSResult[];
    readonly subscriptions: Subscription[];
    connectedCallback(): void;
    private source;
    private sseSubscriptions;
    private theMutant?;
    private theTest?;
    private initializeSse;
    private applyChanges;
    disconnectedCallback(): void;
    private renderTitle;
    render(): import("lit-html").TemplateResult<1>;
    private renderErrorMessage;
    private renderTabs;
}
declare global {
    interface HTMLElementTagNameMap {
        'mutation-test-report-app': MutationTestReportAppComponent;
    }
}
export {};
//# sourceMappingURL=app.component.d.ts.map