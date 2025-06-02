# Maintenance planning (frontend)

### Endpoints (first approximate version)

- ## Person

  > **POST** - ​`/api​/login`  
  > _Autorization_

  > **GET** - ​`/api​/me`  
  > _Personal data_

- ## Departments

  > **GET** - ​`/api​/departments`  
  > _Hierarchical list of departments_

  > **GET** - ​`/api​/departments/{dep_id}`  
  > _Departments Data with Id - {dep_id}_

  > **POST** - ​`/api​/departments`  
  > _Add new department_

  > **PUT** - `​/api​/departments/{dep_id}`  
  > _Update department with id - {dep_id}_

  > **DELETE** - ​`/api​/departments/{dep_id}`  
  > _Delete department with id - {dep_id}_

- ## Users

  > **GET** - ​`/api​/users`  
  > _Accessible user list_

  > **GET** - ​`/api​/users/{uid}`  
  > _Users Data with Id - {uid}_

  > **POST** - `​/api​/users`  
  > _Add new user_

  > **PUT** - `​/api​/users/{uid}`  
  > _Update user with id - {uid}_

  > **DELETE** - ​`/api​/users/{uid}`  
  > _Delete user with id - {uid}_

- ## Roads

  > **GET** - `​/api​/roads`  
  > _Accessible roads list_

  > **GET** - ​`/api​/roads/{road_id}`  
  > _Roads Data with Id - {road_id}_

  > **POST** - ​`/api​/roads`  
  > _Add new road_

  > **PUT** - `​/api​/roads/{road_id}`  
  > _Update road with id - {road_id}_

  > **DELETE** - ​`/api​/roads/{road*id}`  
  > _Delete road with id - {road_id}_

  - ### Roads Sections

    > **GET** - ​`/api​/roads/{road_id}/sections`  
    > _Accessible roads sections list with road_id_

    > **GET** - ​`/api​/roads/{road_id}/sections/{sec_id}`  
    > _Roads Sections Data with Id - {road_id}, {sec_id}_

    > **POST** - ​`/api​/roads/{road_id}/sections`  
    > _Add new roads section_

    > **PUT** - ​`/api​/roads/{road_id}/sections/{sec_id}`  
    > _Update roads section with id - {road_id}, {sec_id}_

    > **DELETE** - ​`/api​/roads/{road_id}/sections/{sec_id}`  
    > _Delete roads section with id - {road_id}, {sec_id}_

* ## Import Data

  > **POST** - `​/api​/importdata/{year}`  
  > _Create a new data structure in the database for the specified year - {year}_

* ## Planning

  > **GET** - `​/api​/plans`  
  > _Accessible plans list_

  > **GET** - ​`/api​/plans/{plan_id}`  
  > _Plans Detail Data with Id - {plan_id}_

  > **POST** - ​`/api​/plans`  
  > _Add new plan_

  > **PUT** - ​`/api​/plans/{plan_id}`  
  > _Update plan with id - {plan_id}_

  > **DELETE** - `​/api​/plans/{plan_id}`  
  > _Delete plan with id - {plan_id}_

* ## Works

  > **GET** - ​`/api​/works`  
  > _Accessible works list_

  > **GET** - ​`/api​/works/{work_id}`  
  > _Works Detail Data with Id - {work_id}_

  > **POST** - ​`/api​/works`  
  > _Add new work_

  > **PUT** - ​`/api​/works/{work_id}`  
  > _Update work with id - {work_id}_

  > **DELETE** - ​`/api​/works/{work_id}`  
  > _Delete work with id - {work_id}_  

* ## Summary

  > **GET** - ​`/api​/summary`  
  > _Accessible data for graphs_

___
## _All GET endpoints can contain the following parameters_
### Parameters

| Name             | Description           | pattern                          | Comments            |
|:-----------------|----------------------:|----------------------------------|-------------------- |
| sort   [string]  | Fields sorting        |`?sort=name,-year`                |                     |
| limit  [integer] | Rows limit	           |`?limit=5`                        | (_for paggination_) |
| offset [integer] | Offset returned rows  |`?offset=5`                       | (_for paggination_) |
| filter [string]  | Fields filter         |`?filter=maitenance[eq]:'routine'`|                     |

#### Samples
> `/api​/plans?sort=year,-cost,work&filter=maitenance[eq]:'routine'`  
> _Get plans list with query params:_  
 `SELECT {...} FROM {planning} WHERE maitenance = 'routine' ORDER BY year, work ASC, cost DESC`

>  `/api/users?sort=name,-deleted&offset=5&limit=5`  
> _Get users list with query params:_  
 `SELECT {...} FROM {users} ORDER BY name ASC, deleted DESC LIMIT 5 OFFSET 5`