import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** أي عملية أساسية متاحة لأي كيان في النظام الخلفي */
export interface CrudResource<T> {
  /** اسم الكيان بصيغة الجمع كما هو معرّف في الـ API */
  readonly name: string;
  list(): Observable<T[]>;
  get(id: number): Observable<T>;
  create(payload: Partial<T>): Observable<T>;
  update(id: number, payload: Partial<T>): Observable<T>;
  remove(id: number): Observable<void>;
}

/**
 * تنفيذ عام لكل نقاط النهاية (CRUD) الموجودة في الواجهة الخلفية.
 * جميع الـ Controllers تتبع نفس النمط: GET /api/X, GET /api/X/{id},
 * POST /api/X, PUT /api/X/{id}, DELETE /api/X/{id}
 */
export class RestResource<T extends { id: number }> implements CrudResource<T> {
  constructor(
    protected readonly http: HttpClient,
    private readonly baseUrl: string,
    readonly name: string,
  ) {}

  protected get url(): string {
    return `${this.baseUrl}/${this.name}`;
  }

  list(): Observable<T[]> {
    return this.http.get<T[]>(this.url);
  }

  get(id: number): Observable<T> {
    return this.http.get<T>(`${this.url}/${id}`);
  }

  create(payload: Partial<T>): Observable<T> {
    return this.http.post<T>(this.url, payload);
  }

  update(id: number, payload: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.url}/${id}`, { ...payload, id });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
